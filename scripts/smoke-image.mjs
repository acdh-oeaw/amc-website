import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const image = process.argv[2];
assert.ok(image, "Usage: node scripts/smoke-image.mjs <image>");

/** @param {...string} args */
function docker(...args) {
	return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

// Inspect the deployed module rather than the source: build-time validation and
// secret values must not override the environment of the running container.
const probe = `
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const chunks = '/app/server/chunks';
const name = (await readdir(chunks)).find(name => name.startsWith('env.config_') && name.endsWith('.mjs'));
assert.ok(name, 'Missing deployed environment module');
assert.notEqual(process.getuid(), 0, 'The application must run as a non-root user');
if (process.env.EMAIL_SMTP_PORT === 'invalid') {
  await assert.rejects(import(pathToFileURL(join(chunks, name))), { name: 'ValidationError' });
} else {
  const module = await import(pathToFileURL(join(chunks, name)));
  const env = Object.values(module).find(value => value && typeof value === 'object' && 'PUBLIC_APP_BASE_URL' in value);
  assert.ok(env, 'Missing validated environment');
  assert.equal(env.EMAIL_SMTP_PORT, 2525);
  assert.equal(env.KEYSTATIC_SECRET, 'amc-runtime-secret-sentinel');
  const logo = await readFile('/app/public/assets/images/amc-logo.png');
  assert.equal(logo.subarray(1, 4).toString(), 'PNG');
  for (const file of await readdir(chunks)) {
    if (!file.endsWith('.mjs')) continue;
    assert.ok(!(await readFile(join(chunks, file), 'utf8')).includes('amc-build-secret-sentinel'), 'Build secret embedded in the server bundle');
  }
}
`;

let container;
try {
	container = docker(
		"run",
		"--detach",
		"--publish",
		"127.0.0.1::3000",
		"--env",
		"EMAIL_SMTP_PORT=2525",
		"--env",
		"KEYSTATIC_SECRET=amc-runtime-secret-sentinel",
		image,
	);
	const port = docker("port", container, "3000/tcp").split(":").at(-1);
	const baseUrl = `http://127.0.0.1:${port}`;
	let ready = false;
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1000) });
			if (response.ok) {
				assert.match(await response.text(), /Austrian Media Corpus/);
				ready = true;
				break;
			}
		} catch {
			// The server may still be starting.
		}
		await setTimeout(500);
	}
	assert.ok(ready, "The container did not serve the home page within 30 seconds");
	const response = await fetch(`${baseUrl}/api/registration`, {
		method: "POST",
		headers: {
			Origin: "http://localhost:3000",
			"X-Forwarded-Host": "localhost:3000",
			"X-Forwarded-Proto": "http",
		},
		body: new URLSearchParams(),
	});
	assert.equal(response.status, 400, "Invalid registration data should be rejected");
	assert.deepEqual(await response.json(), { message: "Invalid input." });
	docker("exec", container, "node", "--input-type=module", "--eval", probe);
	docker(
		"run",
		"--rm",
		"--env",
		"EMAIL_SMTP_PORT=invalid",
		image,
		"node",
		"--input-type=module",
		"--eval",
		probe,
	);
	console.log(
		"Container smoke test passed: HTTP, runtime environment, validation, assets, and user.",
	);
} catch (error) {
	if (container) {
		console.error(docker("logs", container));
	}
	throw error;
} finally {
	if (container) docker("rm", "--force", container);
}

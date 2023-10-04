import { taskNameToBranchName } from './taskNameToBranchName';

const isNil = (value: unknown): value is null | undefined => value === null || value === undefined;

const getTaskName = async (): Promise<string | undefined> => {
	const heading = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]');
	const breadcrumb = document.querySelector(
		'[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
	);

	if (heading && breadcrumb) {
		const taskName = breadcrumb.textContent + ' ' + heading.textContent;

		return taskName;
	}

	return undefined;
};

const copyText = async (text: string) => {
	const type = 'text/plain';
	const blob = new Blob([text], { type });
	const data = [new ClipboardItem({ [type]: blob })];

	await navigator.clipboard.write(data);
};

function invariant(value: any, message: string): asserts value {
	if (!value) {
		throw new Error('Invariant violation: ' + message);
	}
}

const inputWithCopy = (root: Element, textToCopy: string) => {
	let lastTimeout: NodeJS.Timeout | undefined = undefined;

	const input = root.querySelector('input');
	invariant(input, 'Invalid UI');
	input.value = textToCopy;

	root.addEventListener('click', () => {
		if (lastTimeout !== undefined) {
			clearTimeout(lastTimeout);
		}

		const icon = root.querySelector('.copy-field__icon');
		invariant(icon, 'Invalid UI');
		icon.textContent = '👌';

		lastTimeout = setTimeout(() => {
			icon.textContent = '📋';
		}, 2000);

		copyText(input.value);
	});
};

const onSuccess = (taskName: string) => {
	const branchName = taskNameToBranchName(taskName);
	copyText(branchName);

	const successUi = document.getElementById('success-ui');
	const failureUi = document.getElementById('failure-ui');
	const noaccessUi = document.getElementById('noaccess-ui');

	invariant(successUi && failureUi && noaccessUi, 'Invalid UI');

	successUi.classList.remove('hidden');
	failureUi.classList.add('hidden');
	noaccessUi.classList.add('hidden');

	const branchNameField = successUi.querySelector('#branch');
	const taskNameField = successUi.querySelector('#task');

	invariant(branchNameField && taskNameField, 'Invalid UI');

	inputWithCopy(branchNameField, branchName);
	inputWithCopy(taskNameField, taskName);
};

const onFailure = (errorTitle: string, errorMessage: string) => {
	const successUi = document.getElementById('success-ui');
	const failureUi = document.getElementById('failure-ui');
	const noaccessUi = document.getElementById('noaccess-ui');

	invariant(successUi && failureUi && noaccessUi, 'Invalid UI');

	successUi.classList.add('hidden');
	failureUi.classList.remove('hidden');
	noaccessUi.classList.add('hidden');

	const titleElement = failureUi.querySelector('h4');
	const messageElement = failureUi.querySelector('p');

	invariant(titleElement && messageElement, 'Invalid UI');

	titleElement.textContent = `❌ ${errorTitle}`;
	messageElement.textContent = errorMessage;
};

const onNoAccess = () => {
	const successUi = document.getElementById('success-ui');
	const failureUi = document.getElementById('failure-ui');
	const noaccessUi = document.getElementById('noaccess-ui');

	invariant(successUi && failureUi && noaccessUi, 'Invalid UI');

	successUi.classList.add('hidden');
	failureUi.classList.add('hidden');
	noaccessUi.classList.remove('hidden');
};

const run = async () => {
	let currentTab;

	try {
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

		currentTab = tabs[0];
	} catch (error) {
		console.error(error);

		onNoAccess();

		return;
	}

	if (isNil(currentTab)) {
		onNoAccess();

		return;
	}

	const hasPermissions =
		currentTab.url &&
		((await chrome.permissions.contains) as (permissions: chrome.permissions.Permissions) => Promise<boolean>)({
			permissions: ['scripting'],
			origins: [currentTab.url],
		});

	if (!hasPermissions) {
		onNoAccess();

		return;
	}

	let injectionResults: undefined | Array<chrome.scripting.InjectionResult<string | undefined>> = undefined;

	if (!isNil(currentTab.id)) {
		injectionResults = await chrome.scripting.executeScript({
			target: { tabId: currentTab.id },
			func: getTaskName,
		});
	}

	const frameResult = injectionResults?.[0];

	if (isNil(frameResult) || isNil(frameResult.result)) {
		onFailure('No task!', 'Unable to get task title on this page. Are you sure you are doing everything right?');

		return;
	}

	const taskName = frameResult.result;

	onSuccess(taskName);
};

run();

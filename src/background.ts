const hasRequiredPermissions = async (url: string) => {
	try {
		const has = await (
			chrome.permissions.contains as (permissions: chrome.permissions.Permissions) => Promise<boolean>
		)({
			permissions: ['scripting'],
			origins: [url],
		});

		return has;
	} catch (error) {
		console.warn('Ignored error: ', error);

		return false;
	}
};

chrome.tabs.onUpdated.addListener(async (_tabId, _changeInfo, tabInfo) => {
	if (tabInfo.url && (await hasRequiredPermissions(tabInfo.url))) {
		await chrome.action.setIcon({
			path: './logo.png',
			tabId: tabInfo.id,
		});
	}
});

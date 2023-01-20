const MAX_BRANCH_LENGTH = 200;

const normalizeDelimiter = (delimiter: string) => {
	return delimiter
		.replace(/[,]/, '')
		.replace(/\._+/g, '_')
		.replace(/-_+/g, '-')
		.replace(/_+-/g, '-')
		.replace(/-+/g, '-')
		.replace(/_+/g, '_');
};

const normalizeLastDelimiter = (delimiter: string) => {
	return normalizeSegment(delimiter).replace(/_+$/g, '');
};

const normalizeSegment = (segment: string) => {
	return segment
		.replace(/[\/\{\}\[\]^?*:~]/g, '_')
		.replace(/\.+/, '.')
		.replace(/_+/g, '_')
		.replace(/\.+$/, '');
};

export const taskNameToBranchName = (taskName: string) => {
	const segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });

	const segmentsData = [...segmenter.segment(taskName)];

	let branchName = '';
	let delimiter = '';

	for (let i = 0; i < segmentsData.length; ++i) {
		const currentSegmentData = segmentsData[i]!;

		if (currentSegmentData.isWordLike) {
			let newSegment = '';

			if (branchName !== '') {
				newSegment += normalizeDelimiter(delimiter);
			}

			delimiter = '';

			newSegment += currentSegmentData.segment;

			newSegment = normalizeSegment(newSegment);

			if (branchName.length + newSegment.length < MAX_BRANCH_LENGTH) {
				branchName += newSegment;
			} else {
				break;
			}
		} else {
			delimiter += currentSegmentData.segment.trim().length === 0 ? '_' : currentSegmentData.segment.trim();
		}
	}

	const lastDelimiter = normalizeLastDelimiter(delimiter);
	if (branchName.length + lastDelimiter.length < MAX_BRANCH_LENGTH) {
		branchName += lastDelimiter;
	}

	return branchName;
};

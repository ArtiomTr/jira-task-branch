import { taskNameToBranchName } from '../src/taskNameToBranchName';

describe('taskNameToBranchName', () => {
	it('must separate words with "_"', () => {
		expect(taskNameToBranchName('Hello that is task name')).toBe('Hello_that_is_task_name');
		expect(taskNameToBranchName("That's words with special-characters")).toBe(
			"That's_words_with_special-characters",
		);
	});

	it('must treat multiple whitespaces as one', () => {
		expect(taskNameToBranchName('Hello     there are   lot of   w hite spaces')).toBe(
			'Hello_there_are_lot_of_w_hite_spaces',
		);
		expect(taskNameToBranchName('Special\tspaces\nin   sentence')).toBe('Special_spaces_in_sentence');
	});

	it('must keep original delimiters', () => {
		expect(taskNameToBranchName('First "Second"')).toBe('First_"Second"');
		expect(taskNameToBranchName('First" Second"')).toBe('First"_Second"');
		expect(taskNameToBranchName('First.Second')).toBe('First.Second');
		expect(taskNameToBranchName('First. Second')).toBe('First_Second');
		expect(taskNameToBranchName('First .Second')).toBe('First_.Second');
		expect(taskNameToBranchName('First - Second')).toBe('First-Second');
		expect(taskNameToBranchName('First, Second')).toBe('First_Second');
		expect(taskNameToBranchName('First       , Second')).toBe('First_Second');
		expect(taskNameToBranchName('First/Second')).toBe('First_Second');
		expect(taskNameToBranchName('First_Second')).toBe('First_Second');
		expect(taskNameToBranchName('First (Second)')).toBe('First_(Second)');
		expect(taskNameToBranchName('First {Second}')).toBe('First_Second');
		expect(taskNameToBranchName('First [Second]')).toBe('First_Second');
	});

	it('must remove illegal characters', () => {
		expect(taskNameToBranchName('hello..world')).toBe('hello.world');
		expect(taskNameToBranchName('bye@{')).toBe('bye@');
		expect(taskNameToBranchName('hello[]')).toBe('hello');
		expect(taskNameToBranchName('hello~bye')).toBe('hello_bye');
	});

	it('must cut long branch name', () => {
		expect(
			taskNameToBranchName(
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure a, expedita' +
					' adipisci eaque ut perferendis voluptate quam quasi enim veritatis ' +
					'nisi nostrum ipsa nam quisquam facilis hic sunt voluptates dolorem.',
			),
		).toBe(
			'Lorem_ipsum_dolor_sit_amet_consectetur_adipisicing_elit_Iure_a_expedita_' +
				'adipisci_eaque_ut_perferendis_voluptate_quam_quasi_enim_veritatis_' +
				'nisi_nostrum_ipsa_nam_quisquam_facilis_hic_sunt_voluptates',
		);
	});

	it('must remove spaces at the beginning', () => {
		expect(taskNameToBranchName('   Hello worl  d')).toBe('Hello_worl_d');
	});

	it('must handle complex cases', () => {
		expect(
			taskNameToBranchName(
				"\tALCS-1234   \t\nSYS.120 hello'is \"str\" Hello world, et. - 'That' is parse_int something",
			),
		).toBe("ALCS-1234_SYS.120_hello'is_\"str\"_Hello_world_et-'That'_is_parse_int_something");

		expect(taskNameToBranchName('HELLO-world that is the case.')).toBe('HELLO-world_that_is_the_case');
	});
});

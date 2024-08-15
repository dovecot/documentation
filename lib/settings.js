/* List of Dovecot settings value types. */
export const setting_types = {
	BOOLEAN: {
		label: 'Boolean',
		url: '[[link,settings_types_boolean]]'
	},
	IPADDR: {
		label: 'IP Address(es)',
		url: '[[link,settings_types_ip]]'
	},
	SIZE: {
		label: 'Size',
		url: '[[link,settings_types_size]]'
	},
	STRING: {
		label: 'String',
		url: '[[link,settings_types_string]]'
	},
	STRING_NOVAR: {
		label: 'String Without Variables',
		url: '[[link,settings_types_string_novar]]'
	},
	/* This is a String entry, with specific allowable values. */
	ENUM: {
		label: 'String',
		url: '[[link,settings_types_string]]'
	},
	TIME: {
		label: 'Time',
		url: '[[link,settings_types_time]]'
	},
	TIME_MSECS: {
		label: 'Time (milliseconds)',
		url: '[[link,settings_types_time_msecs]]'
	},
	UINT: {
		label: 'Unsigned Integer',
		url: '[[link,settings_types_uint]]'
	},
	OCTAL_UINT: {
		label: 'Octal Unsigned Integer',
		url: '[[link,settings_types_octal_uint]]'
	},
	URL: {
		label: 'URL',
		url: '[[link,settings_types_url]]'
	},
	NAMED_FILTER: {
		label: 'Named Filter',
		url: '[[link,settings_types_named_filter]]'
	},
	NAMED_LIST_FILTER: {
		label: 'Named List Filter',
		url: '[[link,settings_types_named_list_filter]]'
	},
	STRLIST: {
		label: 'String List',
		url: '[[link,settings_types_strlist]]'
	},
	BOOLLIST: {
		label: 'Boolean List',
		url: '[[link,settings_types_boollist]]'
	},
	IN_PORT: {
		label: 'Port Number',
		url: '[[link,settings_types_in_port]]'
	}
}

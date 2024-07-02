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
	URL: {
		label: 'URL',
		url: '[[link,settings_types_url]]'
	},
}

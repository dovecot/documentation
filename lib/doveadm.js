/* List of Doveadm argument value types. */
export const doveadm_arg_types = {
	ARRAY:			1,
	BOOL:			2,
	INTEGER:		3,
	STRING:			4,
	SEARCH_QUERY:	5, // Search query is an ARG_ARRAY
	ISTREAM:		6,
}

/* List of Doveadm flag value types. */
export const doveadm_flag_types = {
	NONE:			0,
	USER:			1,
	USERFILE:		2,
	USERMASK:		4,
}

export const doveadm_args_query = {
	//example: ['mailbox', 'INBOX/myfoldertoo', 'savedbefore', 'since', '30d'],
	positional: true,
	type: doveadm_arg_types.SEARCH_QUERY,
	text: `Search query to apply.`,
}

export const doveadm_args_usermask = {
	positional: true,
	type: doveadm_arg_types.STRING,
	text: `User Mask.`
}

/* Generate command line string for doveadm. */
export function getDoveadmCmdLine(args) {
	let ret = ''

	for (const [k, v] of Object.entries(args)) {
		if (v.hidden) {
			continue;
		}

		if (v.positional) {
			ret += (v.optional ? '[' : '<') + k.replace('-', ' ') + (v.optional ? '] ' : '> ')
		} else {
			ret += '[-'
			if (v.cli) {
				ret += v.cli
			} else {
				ret += '-' + k
			}

			if (v.type != doveadm_arg_types.BOOL) {
				ret += ' ' + k
			}

			ret += '] '
		}
	}

	return ret.trim()
}

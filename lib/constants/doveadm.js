/* List of Doveadm argument value types. */
export const doveadm_arg_types = {
	ARRAY:		1,
	BOOL:		2,
	INTEGER:	3,
	STRING:		4,
	SEARCH_QUERY:	5, // Search query is an ARG_ARRAY
	ISTREAM:	6,
}

/* List of Doveadm flag value types. */
export const doveadm_flag_types = {
	NONE:		0,
	USER:		1,
	USERFILE:	2,
	USERMASK:	4,
}

export const doveadm_args_query = {
	example: ['mailbox', 'INBOX/myfoldertoo', 'savedbefore', 'since', '30d'],
	positional: true,
	type: doveadm_arg_types.SEARCH_QUERY,
	text: `Search query to apply.`,
}

export const doveadm_args_usermask = {
	example: 'username',
	positional: true,
	type: doveadm_arg_types.STRING,
	text: `User Mask.`
}

export const doveadm_args_human_timestamp = `
Allowable formats:

* yyyy-mm-dd (non-UTC),
* IMAP date ("dd-mm-yyyy"; see [[rfc,3501]]) (non-UTC)
* IMAP date-time ("dd-mm-yyy HH:MM:SS +0000; see [[rfc,3501]]) (UTC supported)
* Unix timestamp (UTC supported)
* Interval ("n days", UTC supported)`

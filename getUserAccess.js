/**
 * function for getting and combining global user rights and local for current user
 * @param {*Number} userId 
 * @return Promise {access - boolean, userGroups - object) userGroups {}
 */
getUserAccess: function (userId) {
	// для тестов раздела
	if (uriG.query.getUserEyes && ~[17591, 10842, 17168, 7149, 7459, 9049].indexOf(DATA.user.id)) userId = uriG.query.getUserEyes;
	if (!userId) userId = DATA.user.id;
	// для тестов раздела

	var def = $.Deferred();
	var userGroups = [];
	var result = {
		userId: +userId,
		maxAccessLvl: Infinity,
		userAccess: {},
		userAD: {},
	};
	var optionsGlobal = {
		caml: 'Lookup iUser Includes ' + userId,
	}
	var options = {
		caml: 'Lookup user Eq ' + userId + ' And Boolean active Eq 1',
	}
	$.when(
		m.getUserAccessGlobal(optionsGlobal),
		m.getUsersAccessSection(options),
		m.getUsersADByUid(userId)
	).then(function (userGlobal, user, userAD) {
		var accessUser;
		var removeLvl = [];
		for (var i = 0; i < userGlobal.length; i++) {
			accessUser = userGlobal[i]['iAccess_x003a_iAccess'].get_lookupId();
			var title = userGlobal[i]['iAccess_x003a_iAccess'].get_lookupValue();
			removeLvl.push(accessUser);
			result.userAccess[title] = {
				title: title,
				access: accessUser,
				name: userGlobal[i]['iAccess_x003a_iName'].get_lookupValue(),
			};
			userGroups.push(title);
			if (result.maxAccessLvl > accessUser) {
				result.maxAccessLvl = accessUser;
			}
		}
		for (var i = 0; i < user.length; i++) {
			accessUser = +user[i]['access'];
			var title = user[i]['Title'];
			if (!result.userAccess[title]) result.userAccess[title] = {};
			result.userAccess[title].uid = (result.userAccess[title].uid ? result.userAccess[title].uid : user[i]['ID']);
			result.userAccess[title].title = (result.userAccess[title].title ? result.userAccess[title].title : title);
			result.userAccess[title].access = (result.userAccess[title].access ? result.userAccess[title].access : accessUser);
			result.userAccess[title].name = (result.userAccess[title].name ? result.userAccess[title].name : user[i]['name']);

			if (user[i].typeRating) {
				if (!result.userAccess[title].hasOwnProperty('typeRating')) result.userAccess[title].typeRating = [];
				result.userAccess[title].typeRating.push(user[i].typeRating.get_lookupId());
			}
			userGroups.push(title);
			if (result.maxAccessLvl > accessUser) {
				result.maxAccessLvl = accessUser;
			}
		}
		if (userAD && userAD.length) result.userAD = userAD[0];
		def.resolve(result, userGroups);
	});
	return def;
},

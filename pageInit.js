AR(function () {
	TPL = new ModTemplate({ template: 2, sidebar: 1, main: 1 });
	TPL.router(function (url, LOCAL, context, settings) {
		MAILS_SEND_G = true;
		searcherG = false;
		MAILS_ADMINS_GROUP = isPuz();

		m.getUserAccess().then(function (access, userGroups) {
			userAccessG = access;
			var date = new Date();
			date.setMonth(date.getMonth() - 1);

			if (!userGroupsG) m.getAuthorityForm({ caml: 'DateTime Created Geq ' + date.toISOString() + ' And Lookup choosing Eq ' + userAccessG.userId, recursive: 'allItems' }).then(v.renderAuthorityForm);
			userGroupsG = userGroups;

			camlFilterG = {};
			TPL.set({ main: 1 });
			var viewCommander = 'showMain';
			uriG.parseURI(window.location.href);
			switch (url.section) {
				case 'questions':
					viewCommander = 'showQuestions';
					break;
				case 'question':
					viewCommander = 'showQuestion';
					break;
				case 'expert-map':
					viewCommander = 'showExpertMap';
					break;
				case 'expert':
					viewCommander = 'showExpert'
					break;
				case 'statistics':
					viewCommander = 'showStatistics';
					break;
				case 'personal':
					viewCommander = 'showPersonal';
					break;
				case 'scripts':
					viewCommander = 'showScripts';
					break;
				default:
					viewCommander = 'showMain';
					break;
			}
			TPL.clearAll();
			var page = v[viewCommander];
			page.render();
		})
	}, {
		clear: false
	})
});

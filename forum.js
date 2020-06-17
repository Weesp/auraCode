var uriG = new AuraURI;

var WEB_URL_G = '/app-list/social/forums/';
var LIBRARY_G = {
	Discussions: WEB_URL_G + 'Discussions',
	Communities: WEB_URL_G + 'Communities',
	Groups: WEB_URL_G + 'Groups',
	AccessUsers: WEB_URL_G + 'AccessUsers',
	AccessUsersGlobal: '/app/AccessUsers',
	ReasonsLeavingUsers: WEB_URL_G + 'ReasonsLeavingUsers',
	Materials: WEB_URL_G + 'Materials',
}

var searcherG;
var userAccessG;
var userGroupsG;
var MAILS_SEND_G;
var MAILS_ADMINS_GROUP;

$document = $(document);
AR(function () {
	TPL = new ModTemplate({ template: 1, sidebar: 1, main: 1 });
	TPL.router(function (url, LOCAL, context, settings) {
		MAILS_SEND_G = true;
		//MAILS_ADMINS_GROUP = [17591, 7149];
		MAILS_ADMINS_GROUP = isPuz();
		m.getUserAccess().then(function (access, userGroups) {
			userAccessG = access;
			console.log(userAccessG);
			userGroupsG = userGroups;
			TPL.set({ main: 1 });
			var viewCommander = 'showCommunities';
			uriG.parseURI(window.location.href);
			switch (url.section) {
				case 'communities':
					viewCommander = 'showCommunities';
					break;
				case 'form':
					viewCommander = 'showForm';
					break;
				case 'groups':
					viewCommander = 'showGroups';
					break;
				case 'discussions':
					viewCommander = 'showDiscussions';
					break;
				default:
					viewCommander = 'showMain';
					break;
			}
			TPL.clearAll();
			page = new v[viewCommander]();
			page.render();
		})
	}, {
		clear: false
	})

});

//  ==================================================================
//  ===========  =====  ====    ====       ===        ==  ============
//  ===========   ===   ===  ==  ===  ====  ==  ========  ============
//  ===========  =   =  ==  ====  ==  ====  ==  ========  ============
//  ===========  == ==  ==  ====  ==  ====  ==  ========  ============
//  ===========  =====  ==  ====  ==  ====  ==      ====  ============
//  ===========  =====  ==  ====  ==  ====  ==  ========  ============
//  ===========  =====  ==  ====  ==  ====  ==  ========  ============
//  ===========  =====  ===  ==  ===  ====  ==  ========  ============
//  ===========  =====  ====    ====       ===        ==        ======
//  ==================================================================

var m = {
	getUserAccess: function (userId) {
		// для тестов раздела
		if (uriG.query.getUserEyes && ~[17591, 10842, 17168, 7149, 7459, 9049].indexOf(DATA.user.id)) userId = uriG.query.getUserEyes;
		if (!userId) userId = DATA.user.id;
		// для тестов раздела

		var def = $.Deferred();
		var userGroups = [];
		var result = {
			userId: userId,
			maxAccessLvl: Infinity,
			userAccess: {},
		};
		var optionsGlobal = {
			caml: 'Lookup iUser Includes ' + userId,
		}
		var options = {
			caml: 'Lookup user Eq ' + userId + ' And Boolean active Eq 1',
		}
		$.when(m.getUserAccessGlobal(optionsGlobal), m.getUsersAccessSection(options), m.getMetAcceess()).then(function (userGlobal, user, metAccess) {
			// getUserAccess v0.3
			// console.log(user);
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
			result.metAccess = metAccess;
			// for (var i = 0; i < user.length; i++) {
			// 	accessUser = +user[i]['access'];
			// 	if (removeLvl.indexOf(accessUser) == -1) {
			// 		var title = user[i]['Title'];
			// 		if (!result.userAccess[title]) result.userAccess[title] = {};
			// 		result.userAccess[title].uid = (result.userAccess[title].uid ? result.userAccess[title].uid : user[i]['ID']);
			// 		result.userAccess[title].title = (result.userAccess[title].title ? result.userAccess[title].title : title);
			// 		result.userAccess[title].access = (result.userAccess[title].access ? result.userAccess[title].access : accessUser);
			// 		result.userAccess[title].name = (result.userAccess[title].name ? result.userAccess[title].name : user[i]['name']);
			// 		if (user[i].communities) {
			// 			if (!result.userAccess[title].hasOwnProperty('communities')) result.userAccess[title].communities = [];
			// 			result.userAccess[title].communities.push(user[i].communities.get_lookupId());
			// 		}
			// 		if (user[i].groups) {
			// 			if (!result.userAccess[title].hasOwnProperty('groups')) result.userAccess[title].groups = [];
			// 			result.userAccess[title].groups.push(user[i].groups.get_lookupId());
			// 		}
			// 		userGroups.push(title);
			// 	}
			// 	if (result.maxAccessLvl > accessUser) {
			// 		result.maxAccessLvl = accessUser;
			// 	}
			// }
			def.resolve(result, userGroups);
		});
		return def;
	},
	getMetAcceess: function () {
		var def = $.Deferred();
		QUERY.amIModerator(def.resolve);
		return def;
	},
	getUserAccessGlobal: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.AccessUsersGlobal, def.resolve, options);
		return def;
	},
	getUsersAccessSection: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.AccessUsers, def.resolve, options);
		return def;
	},
	getCommunities: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.Communities, def.resolve, options);
		return def;
	},
	getGroups: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.Groups, def.resolve, options);
		return def;
	},
	updateGroups: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.updateListItems(LIBRARY_G.Groups, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	createGroups: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.createListItem(LIBRARY_G.Groups, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	getUsersInGroupById: function (id) {
		var def = $.Deferred();
		if (id) {
			var options = {
				caml: 'ID Eq ' + id,
				viewFields: ['users'],
			}
			m.getGroups(options).then(function (items) {
				var users;
				var usersIds = [];
				if (items.length) {
					users = items[0].users;
					// console.log(users);
					if (!users) users = [];
					for (var index = 0; index < users.length; index++) {
						var user = users[index];
						usersIds.push(user.get_lookupId());
					}
					def.resolve(usersIds);
				} else {
					def.reject();
				}
			});
		} else {
			def.reject();
		}
		return def;
	},
	getUsersInDiscussionById: function (id) {
		var def = $.Deferred();
		if (id) {
			var options = {
				caml: 'ID Eq ' + id,
				viewFields: ['users'],
			}
			m.getDiscussions(options).then(function (items) {
				var users;
				var usersIds = [];
				if (items.length) {
					users = items[0].users;
					// console.log(users);
					if (!users) users = [];
					for (var index = 0; index < users.length; index++) {
						var user = users[index];
						usersIds.push(user.get_lookupId());
					}
					def.resolve(usersIds);
				} else {
					def.reject();
				}
			});
		} else {
			def.reject();
		}
		return def;
	},
	controlUserInGroup: function (idGroup, event, eventUsers) {
		var def = $.Deferred();
		if (!eventUsers) eventUsers = +DATA.user.id;
		if (!eventUsers.length) eventUsers = [eventUsers];
		if (!event) event = 'add';
		this.getUsersInGroupById(idGroup).then(function (users) {
			// console.log(users);
			var resultUser = [];
			switch (event) {
				case 'del':
					for (var index = 0; index < users.length; index++) {
						var user = users[index];
						if (!~eventUsers.indexOf(user)) {
							resultUser.push(user);
						}
					}
					break;
				default:
					// console.log(eventUsers);
					for (var index = 0; index < eventUsers.length; index++) {
						var addUser = eventUsers[index];
						if (!~users.indexOf(addUser)) {
							// console.log(addUser);

							users.push(addUser);
						}
					}
					resultUser = users;
					break;
			}
			m.updateGroups({ users: resultUser, ID: idGroup }).then(def.resolve);
		});
		return def;
	},
	controlUserInDiscussion: function (idDiscussion, event, eventUsers) {
		var def = $.Deferred();
		if (!eventUsers) eventUsers = +DATA.user.id;
		if (!eventUsers.length) eventUsers = [eventUsers];
		if (!event) event = 'add';
		this.getUsersInDiscussionById(idDiscussion).then(function (users) {
			// console.log(users);
			var resultUser = [];
			switch (event) {
				case 'del':
					for (var index = 0; index < users.length; index++) {
						var user = users[index];
						if (!~eventUsers.indexOf(user)) {
							resultUser.push(user);
						}
					}
					break;
				default:
					// console.log(eventUsers);
					for (var index = 0; index < eventUsers.length; index++) {
						var addUser = eventUsers[index];
						if (!~users.indexOf(addUser)) {
							// console.log(addUser);

							users.push(addUser);
						}
					}
					resultUser = users;
					break;
			}
			m.updateDiscussions({ users: resultUser, ID: idDiscussion }).then(def.resolve);
		});
		return def;
	},
	getDiscussions: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.Discussions, def.resolve, options);
		return def;
	},
	updateDiscussions: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.updateListItems(LIBRARY_G.Discussions, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	createDiscussions: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.createListItem(LIBRARY_G.Discussions, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	updateCommunities: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.updateListItems(LIBRARY_G.Communities, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	createCommunities: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.createListItem(LIBRARY_G.Communities, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	createReasonsLog: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.createListItem(LIBRARY_G.ReasonsLeavingUsers, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	getDataFromForms: function (data, library) {
		// console.log(data);
		var itemDef = $.Deferred();
		if (data) {
			if (typeOf(data) === 'object') {
				itemDef.resolve(data);
			} else if (typeOf(data) === 'number' && library) {
				// идём смотреть в базу
				QUERY.getListItemById(LIBRARY_G[library], data, itemDef.resolve);
			} else {
				itemDef.resolve();
			}
		} else {
			itemDef.resolve();
		}
		return itemDef;
	},
	createUserAccess: function (formInputs, options) {
		var def = $.Deferred();
		Object.keys(formInputs).length ? QUERY.createListItem(LIBRARY_G.AccessUsers, formInputs, def.resolve, options) : def.resolve();
		return def;
	},
	updateUserAccess: function (formInputs, options) {
		var def = $.Deferred();
		if (typeOf(formInputs) != 'array') formInputs = [formInputs];
		formInputs.length ? QUERY.updateListItems(LIBRARY_G.AccessUsers, formInputs, def.resolve, options) : def.resolve();
		return def;
	},
	getUsersADByUid: function (usersIds, options) {
		var def = $.Deferred();
		usersIds ? QUERY.getUsersADByUid(usersIds, def.resolve, options) : def.resolve();
		return def;
	},
	updateUserAccessG: function (user) {
		for (var i = 0; i < user.length; i++) {
			accessUser = +user[i]['access'];
			var title = user[i]['Title'];
			if (!userAccessG.userAccess[title]) userAccessG.userAccess[title] = {};
			userAccessG.userAccess[title].uid = (userAccessG.userAccess[title].uid ? userAccessG.userAccess[title].uid : user[i]['ID']);
			userAccessG.userAccess[title].title = (userAccessG.userAccess[title].title ? userAccessG.userAccess[title].title : title);
			userAccessG.userAccess[title].access = (userAccessG.userAccess[title].access ? userAccessG.userAccess[title].access : accessUser);
			userAccessG.userAccess[title].name = (userAccessG.userAccess[title].name ? userAccessG.userAccess[title].name : user[i]['name']);
			if (user[i].communities) {
				if (!userAccessG.userAccess[title].hasOwnProperty('communities')) userAccessG.userAccess[title].communities = [];
				userAccessG.userAccess[title].communities.push(user[i].communities.get_lookupId());
			}
			if (user[i].groups) {
				if (!userAccessG.userAccess[title].hasOwnProperty('groups')) userAccessG.userAccess[title].groups = [];
				userAccessG.userAccess[title].groups.push(user[i].groups.get_lookupId());
			}
			userGroupsG.push(title);
			if (userAccessG.maxAccessLvl > accessUser) {
				userAccessG.maxAccessLvl = accessUser;
			}
		}
	},
	getMaterials: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.Materials, def.resolve, options);
		return def;
	},
	updateMaterials: function (inputs, options) {
		var def = $.Deferred();
		if (typeOf(inputs) != 'array') inputs = [inputs];
		if (inputs.length) {
			QUERY.updateListItems(LIBRARY_G.Materials, inputs, def.resolve, options);
		} else {
			def.reject();
		}
		return def;
	},
	deleteMaterialByID: function (id, options) {
		var def = $.Deferred();
		QUERY.deleteListItem(LIBRARY_G.Materials, id, def.resolve, options);
		// def.resolve(id);
		return def;
	},
	getUsersAD: function (option) {
		if (!option) option = {
			caml: 'Boolean isActive Eq 1',
			mapBy: 'uid',
			viewFields: ['ID', 'uid', 'ShortPath', 'Avatar', 'PersonID', 'AvatarPos', 'FullPath', 'Title', 'PhoneInt', 'Position', 'Knowledges']
		}
		var def = $.Deferred();
		var time = new Date();
		QUERY.getListItems('/AM/UsersAD', function (users) {
			console.warn('UsersAD:', 'get time = ' + (new Date() - time), 'count = ' + Object.keys(users).length);
			def.resolve(users);
		}, option);
		return def;
	},
}

//  =========================================================
//  ===========  ====  ==    ==        ==  ====  ====  ======
//  ===========  ====  ===  ===  ========  ====  ====  ======
//  ===========  ====  ===  ===  ========  ====  ====  ======
//  ===========  ====  ===  ===  ========  ====  ====  ======
//  ===========   ==   ===  ===      ====   ==    ==  =======
//  ============  ==  ====  ===  =========  ==    ==  =======
//  ============  ==  ====  ===  =========  ==    ==  =======
//  =============    =====  ===  ==========    ==    ========
//  ==============  =====    ==        =====  ====  =========
//  =========================================================

var v = {
	showMain: function () {
		this.render = function () {
			if (userAccessG.maxAccessLvl > 1) {
				document.location.href = "http://aura.dme.aero.corp/";
			} else {
				TPL.set({ main: 2 });
				var tplsData = {};
				this.renderHeader(tplsData);
				this.renderContent(tplsData);
				v.renderMain(tplsData);
			}
		};
		this.renderHeader = function (tplsData) {
			TPL.addBlockMain('header-main', function (block, content) {
				tplsData.header = {
					name: 'header-main',
					block: block,
					content: content,
				}
				content.append('\
					<div class="js-search-input-container"></div>\
				');
			});
		};
		this.renderContent = function (tplsData) {
			var options = {};
			options.note = {
				right: [{
					name: 'Создать новое сообщество',
					onClick: function () {
						//m.getDataFromForms().then(function (item) {
						v.renderFormCommunities();
						//})
					}
				}],
			};
			TPL.addBlockMain('main', function (block, content) {
				tplsData.main = {
					name: 'main',
					block: block,
					content: content,
				};
			}, options);
		};
	},
	// checkAccess: function () {
	// 	var id = uriG.query.target ? uriG.query.target : false;
	// 	var section = uriG.query.section ? uriG.query.section : false;
	// 	// console.log(userAccessG, id, section);
	// 	// console.log(userAccessG);
	// 	for (var key in userAccessG.userAccess) {
	// 		if (userAccessG.userAccess.hasOwnProperty(key)) {
	// 			var element = userAccessG.userAccess[key];
	// 			// console.log(element);
	// 			if()
	// 		}
	// 	}
	// },
	showCommunities: function () {
		this.render = function () {
			TPL.set({ main: 2 });
			var id = uriG.query.target ? uriG.query.target : false;
			var it = this;
			if (id) {
				var tplsData = {};
				var options = {
					caml: 'ID Eq ' + id,
				}
				m.getCommunities(options).then(function (items) {
					var item = items[0];
					var userId;
					if (uriG.query.getUserEyes && ~[17591, 10842, 17168, 7149, 7459].indexOf(DATA.user.id)) userId = uriG.query.getUserEyes;
					if (!userId) userId = DATA.user.id;
					m.getUsersAccessSection({ caml: 'Lookup communities Eq ' + item.ID + ' And Lookup user Eq ' + userId }).then(function (user) {
						if (user.length) {
							m.updateUserAccessG(user);
						}
						if (item) {
							it.renderHeader(tplsData, item);
							it.renderContent(tplsData, item);
							v.renderCommunities(tplsData, item);
						} else {
							console.warn('потерялся');
							TPL.locationError(404);
						}
					})

				});
			} else {
				// go away
				TPL.locationError(404);
			}
		};
		this.renderHeader = function (tplsData, item) {
			// console.log(item);
			var communityId = (item && item.ID ? item.ID : false);
			var userAccess = getAccess(communityId);
			// console.log(userAccessG.metAccess);
			var options = {};
			if (userAccessG.maxAccessLvl <= 1 && userAccessG.metAccess) {
				if (!options.menu) options.menu = [];
				options.menu.push({
					name: "Модераторы",
					onClick: function () {
						v.absoluteAddForm(item).then(TPL.restartRouter);
					},
					itEvent: true,
				});
				options.menu.push({
					name: "Список ПФ",
					onClick: function () {
						document.location.href = "http://aura.dme.aero.corp/app-pages/forums/type.aspx";
					},
					itEvent: true,
				});

			}
			if (userAccessG.maxAccessLvl < 2.2 && userAccess) {
				if (!options.menu) options.menu = [];
				options.menu.push({
					name: "Настройки ПФ",
					onClick: function () {
						v.renderFormCommunities(item);
					},
					itEvent: true,
				});
			}

			TPL.addBlockMain('header-communities', function (block, content) {
				tplsData.header = {
					name: 'header-communities',
					block: block,
					content: content,
				}
				content.append('\
					'+ (item.url ? ' <div class="community-description__back">\
						<a href="'+ item.url + '" class="g-button-back">\
							<div>\
								<div class="s-icon s-icon-arrow-left"></div>\
							</div>\
							<div>Назад</div>\
						</a>\
					</div>': '') + '\
					'+ (item.description ?
						'<div class="community-description">\
							<div class="community-description__heading">' + item.Title + '</div>\
							<div class="community-description__additional">\
								<div class="g-content">\
									' + item.description + '\
								</div>\
							</div>\
						</div>'
						: '') + '\
					<div class="community-active">\
						<div class="description-block__meta-info">\
							<div class= "js-search-input-container" ></div >\
						</div>\
					</div>\
					');
			}, options);
		};
		this.renderContent = function (tplsData, item) {
			var options = {};
			options.note = {
				right: [{
					name: 'Создать новую группу',
					onClick: function () {
						v.renderFormGroup().then(function (group) {
							if (group.length) group = group[0];
							if (group) {
								var options = {
									caml: '(Lookup communities Eq ' + item.ID + ' And active Eq 1) And Text Title Eq absolute-forum',
								}
								m.getUsersAccessSection(options).then(function (items) {
									var to = MAILS_ADMINS_GROUP;
									if (items) {
										for (var index = 0; index < items.length; index++) {
											var moderator = items[index];
											if (moderator.user) {
												to.push(moderator.user.get_lookupId());
											}
										}
									}
									var theme = 'Поступила заявка на создание группы ' + group.Title + ' в форуме ' + item.Title;
									var body = '\
									<p>\
										Пользователь '+ group.Author.get_lookupValue() + ' оставил заявку на создание новой группы «' + group.Title + '» в форуме «' + item.Title + '»\
									</p>\
									<p>\
										Чтобы утвердить или отклонить группу, перейдите <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target='+ group.ID + '"> по этой ссылке</a>\
									</p>\
									';
									new Mail(['aura'], to, theme, body, false, {
										template: true,
										send: MAILS_SEND_G,
									});
									TPL.restartRouter();
								});
							};
						});
					}
				}],
			};
			TPL.addBlockMain('main', function (block, content) {
				tplsData.main = {
					name: 'main',
					block: block,
					content: content,
				};
			}, options);
		};
	},
	showGroups: function () {
		this.render = function () {
			var id = uriG.query.target ? uriG.query.target : false;
			var it = this;
			if (id) {
				var tplsData = {};
				var options = {
					caml: 'ID Eq ' + id,
				}
				// if (userAccessG.maxAccessLvl > 2.2) {
				// 	options.caml += ' And Boolean active Eq 1';
				// }
				m.getGroups(options).then(function (items) {
					var item = items[0];
					// console.log(item);
					if (item) {
						var userId;
						if (uriG.query.getUserEyes && ~[17591, 10842, 17168, 7149, 7459].indexOf(DATA.user.id)) userId = uriG.query.getUserEyes;
						if (!userId) userId = DATA.user.id;
						m.getUsersAccessSection({ caml: '(Lookup communities Eq ' + item.community.get_lookupId() + ' Or Lookup groups Eq ' + item.ID + ') And Lookup user Eq ' + userId }).then(function (user) {
							if (user.length) {
								m.updateUserAccessG(user);
							}
							// userAccessG.maxAccessLvl == 7;
							// console.log(userAccessG);
							var communityId = (item && item.community ? item.community.get_lookupId() : false);
							var groupId = (item && item.group ? item.group.get_lookupId() : false);
							var userAccess = getAccess(communityId, groupId);
							// console.log(userAccess);
							if ((!item.active || item.status == 'reject') && userAccessG.maxAccessLvl > 2.2) {
								console.log(11111);

								TPL.locationError(403);
							} else {
								it.renderHeader(tplsData, item);
								it.renderContent(tplsData, item);
								// if (DATA.user.id == 17591) {
								it.renderUserExpertsWidgetTpl(tplsData, item, userAccess);
								v.renderExpertGroupWidget(tplsData, item, userAccess);
								// }
								it.renderUserGroupWidgetTpl(tplsData, item);
								v.renderUserGroupWidget(tplsData, item);
								v.renderGroups(tplsData, item);
							}

						});
					} else {
						console.warn('потерялся');
						TPL.locationError(404);
					}
				});
			} else {
				// go away
				TPL.locationError(404);
			}
		};
		this.renderUserGroupWidgetTpl = function (tplsData) {
			TPL.addBlockWidget('user-group', function (block, content) {
				tplsData.userGroup = {
					name: 'user-group',
					block: block,
					content: content,
				}
			}, {
				heading: {
					name: 'Участники',
				},
				menu: [],
			});
		}
		this.renderUserExpertsWidgetTpl = function (tplsData, item, userAccess) {
			var options = {};
			options.heading = { name: 'Эксперты' };
			if (userAccessG.maxAccessLvl < 2.3 && userAccess) {
				options.menu = [];
			}
			TPL.addBlockWidget('user-experts', function (block, content) {
				tplsData.userExperts = {
					name: 'user-experts',
					block: block,
					content: content,
				}
			}, options);
		}
		this.renderHeader = function (tplsData, item) {
			var options = {};
			var communityId = (item && item.community ? item.community.get_lookupId() : false);
			var userAccess = getAccess(communityId, item.ID);
			if (userAccessG.maxAccessLvl < 2.3 && userAccess) {
				options.menu = [];
				if (!item.status) {
					options.menu.push({
						name: "Утвердить",
						onClick: function () {
							approveGroup(item.ID).then(function (group) {
								TPL.restartRouter();
							});
						},
						itEvent: true,
					});
					options.menu.push({
						name: "Отклонить",
						onClick: function () {
							rejectGroup(item.ID).then(function (group) {
								TPL.restartRouter('/app-pages/forums/type.aspx' + (communityId ? '?section=communities&target=' + communityId : ''));
							})
						},
						itEvent: true,
					});
				}
				options.menu.push({
					name: "Редактировать",
					onClick: function () {
						// console.log(item);
						v.renderFormGroup(item);
					},
					itEvent: true,
				});
				options.menu.push({
					name: "Удалить",
					onClick: function () {
						rejectGroup(item.ID, 'delete').then(function (group) {
							TPL.restartRouter('/app-pages/forums/type.aspx' + (communityId ? '?section=communities&target=' + communityId : ''));
						})
					},
					itEvent: true,
				});
			}
			TPL.addBlockMain('header-groups', function (block, content) {
				tplsData.header = {
					name: 'header-groups',
					block: block,
					content: content,
				}
				content.append('\
					<div class="community-description__back">\
						<a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx'+ (communityId ? '?section=communities&target=' + communityId : '') + '" class="g-button-back item_url">\
							<div>\
								<div class="s-icon s-icon-arrow-left"></div>\
							</div>\
							<div>Назад</div>\
						</a>\
					</div>\
					'+ (item.description ?
						'<div class="community-description">\
							<div class="community-description__heading">' + item.Title + '\
								'+ (item.status == 'reject' ? '<span style="color:#f67;">\
									- Удалено\
								</span>': '') + '\
								'+ (!item.status ? ' <div class="not-active__label"></div > ' : '') + '\
							</div>\
							<div class="community-description__additional">\
								<div class="g-content">\
									' + item.description + '\
								</div>\
							</div>\
						</div>'
						: '') + '\
					<div class="community-active">\
						<div class="description-block__meta-info">\
							<div class= "js-search-input-container" ></div >\
						</div>\
					</div>\
					');
			}, options);
		};
		this.renderContent = function (tplsData, item) {
			var options = {};
			var usersIds = [];
			if (item.users) {
				for (var index = 0; index < item.users.length; index++) {
					var userLookup = item.users[index];
					usersIds.push(userLookup.get_lookupId());
				}
			}
			// console.log(usersIds);
			//if (~usersIds.indexOf(DATA.user.id) || userAccessG.maxAccessLvl < 2.5) {
			if (~usersIds.indexOf(+DATA.user.id)) {
				options.note = {
					right: [{
						name: 'Создать обсуждение',
						onClick: function () {
							v.renderFormDiscussion();
						}
					}],
				};
			}
			TPL.addBlockMain('main', function (block, content) {
				tplsData.main = {
					name: 'main',
					block: block,
					content: content,
				};
			}, options);
		};
	},
	showDiscussions: function () {
		this.render = function () {
			TPL.set({ main: 2 });
			var id = uriG.query.target ? uriG.query.target : false;
			var it = this;
			if (id) {
				var tplsData = {};
				var options = {
					caml: 'ID Eq ' + id,
				}
				m.getDiscussions(options).then(function (items) {
					var item = items[0];
					// console.log(item);
					if (item && item.group) {
						m.getGroups({ caml: 'ID Eq ' + item.group.get_lookupId() }).then(function (group) {
							if (group.length) group = group[0];
							// console.log(group);
							var userId;
							if (uriG.query.getUserEyes && ~[17591, 10842, 17168, 7149, 7459].indexOf(DATA.user.id)) userId = uriG.query.getUserEyes;
							if (!userId) userId = DATA.user.id;
							m.getUsersAccessSection({ caml: '(Lookup communities Eq ' + group.community.get_lookupId() + ' Or Lookup groups Eq ' + group.ID + ') And Lookup user Eq ' + userId }).then(function (user) {
								if (user.length) {
									m.updateUserAccessG(user);
								}
								// console.log(userAccessG);
								var communityId = (item && item.community ? item.community.get_lookupId() : false);
								var groupId = (item && item.group ? item.group.get_lookupId() : false);
								var userAccess = getAccess(communityId, groupId);
								// console.log(userAccess);

								if (!item.active && userAccessG.maxAccessLvl > 2.2) {
									console.log(22222);
									TPL.locationError(403);
								} else {
									it.renderHeader(tplsData, item);
									it.renderContent(tplsData, item);
									if (item.status == 'hidden') {
										TPL.set({ main: 1 });
										it.renderUserGroupWidgetTpl(tplsData, item);
										v.renderUserDiscussionWidget(tplsData, item);
									}
									// if (DATA.user.id == 17591) {
									// console.log(item);

									it.renderWidgetMaterials(tplsData, item);
									// }
									if (group.active || (userAccessG.maxAccessLvl < 2.2)) {
										v.renderDiscussions(tplsData, item, group);
									} else {
										console.warn('потерялся');
										TPL.locationError(404);
									}
								}

							});
						})
					} else {
						console.warn('потерялся');
						TPL.locationError(404);
					}
				});
			} else {
				// go away
				TPL.locationError(404);
			}
		};
		this.renderWidgetMaterials = function (tplsData, item) {
			var option = {};
			option.heading = {
				name: 'Материалы',
			}
			if (userAccessG.maxAccessLvl < 2.2) {
				option.menu = [];
				option.menu.push({
					name: "Управление материалами",
					onClick: function () {
						v.controlMaterialsForm(item, 'materials').then(function (filesIds) {
							m.updateDiscussions({ materials: filesIds, ID: item.ID }).then(function () {
								TPL.restartRouter();
							});
						});
					},
					itEvent: true,
				});
			}
			TPL.addBlockWidget('meeting-materials', function (block, content) {
				tplsData.materials = {
					name: 'meeting-materials',
					block: block,
					content: content,
				};
			}, option);
		};
		this.renderHeader = function (tplsData, item) {
			// console.log(item);
			var options = {};
			var groupId = (item && item.group ? item.group.get_lookupId() : false);
			var groupName = (item && item.group ? item.group.get_lookupValue() : false);
			TPL.addBlockMain('header-disscution', function (block, content) {
				tplsData.header = {
					name: 'header-disscution',
					block: block,
					content: content,
				}
				content.append('\
					<div class="t-block__heading">\
						<div>\
							<div class="t-block__heading-text">\
								<a href="'+ DATA.environment.path + (groupId ? '?section=groups&target=' + groupId : '') + '" target="_self" data-single="single">\
									'+ (item ? groupName : '') + '\
								</a>\
							</div>\
							<div class="t-block__heading-additional"></div>\
						</div>\
					</div>\
				');
			}, options);
		};
		this.renderUserGroupWidgetTpl = function (tplsData) {
			TPL.addBlockWidget('user-group', function (block, content) {
				tplsData.userGroup = {
					name: 'user-group',
					block: block,
					content: content,
				}
			}, {
				heading: {
					name: 'Участники',
				},
				menu: [],
			}
			);
		}
		this.renderContent = function (tplsData, item) {
			var options = {};
			var groupId = (item && item.group ? item.group.get_lookupId() : false);
			var urlGroup = DATA.environment.path + (groupId ? '?section=groups&target=' + groupId : '');
			if (userAccessG.maxAccessLvl < 2.2 || DATA.user.id === item.Author.get_lookupId()) {
				options.menu = [];
				options.menu.push({
					name: "Редактировать",
					onClick: function () {
						v.renderFormDiscussion(item);
					},
					itEvent: true,
				});
				options.menu.push({
					name: "Удалить",
					onClick: function () {
						// console.log(item);
						m.updateDiscussions({ active: 0, ID: item.ID }).then(function () {
							new AuraForm([
								{
									title: 'Успешно',
								}, {
									html: 'Обсуждение "' + item.Title + '" удалено',
								}
							], function () {
								TPL.restartRouter(urlGroup);
							});

						})

					},
					itEvent: true,
				});
			}
			TPL.addBlockMain('disscution', function (block, content) {
				tplsData.disscution = {
					name: 'disscution',
					block: block,
					content: content,
				};
				content.append('\
					<div class="disscution-description__back">\
						<a href="'+ urlGroup + '" class="g-button-back item_url">\
							<div>\
								<div class="s-icon s-icon-arrow-left"></div>\
							</div>\
							<div>Назад</div>\
						</a>\
					</div>\
				');
			}, options);
		};
	},
	renderCommunities: function (tplsData, community) {
		// console.log(tplsData, community);
		var caml = 'Lookup community Eq ' + community.ID + ' And Boolean active Eq 1';
		if (userAccessG.maxAccessLvl < 2.2) caml = 'Lookup community Eq ' + community.ID + ' And Text status Neq reject';
		if (userAccessG.maxAccessLvl && userAccessG.maxAccessLvl > 2.2) {
			caml = '(' + caml + ')' + ' And Text status Eq approved';
		}
		var columns = ['Title', 'annotation', 'tags', 'moderator'];
		var itemMapById = {};
		searcherG && searcherG.destroy();
		searcherG = new Searcher(LIBRARY_G.Groups, {
			preRender: function (item, def) {
				// console.log(item);
				var fields = {};
				var authorIds = [];
				for (var index = 0; index < item.length; index++) {
					authorIds.push(item[index].moderator.get_lookupId());
				}
				m.getUsersADByUid(authorIds, { mapBy: 'uid' }).then(function (result) {
					fields.authors = result;
					def.resolve(fields);
				});
			},
			render: function (item, container, fields) {
				// console.log(item);
				// console.log(fields);
				var author = fields.authors[item.moderator.get_lookupId()];
				// console.log(author);
				var tagsStr = '';
				var menu = '';
				var menuColums = '';
				var menuControl = false;
				itemMapById[item.ID] = item;
				if (item.tags) {
					for (var key in item.tags) {
						tagsValue = item.tags[key].get_lookupValue();
						tagsStr += '\
							<a class="navigator a-form__tag a-form__tag_base a-form__tag_link item_url" \
								href="/app-pages/forums/type.aspx?section=communities&target='+ community.ID + '&search=' + tagsValue + '">\
								' + tagsValue + '\
							</a>\
						';
					}
				}
				if ((item.moderator && item.moderator.get_lookupId() === DATA.user.id) || userAccessG.maxAccessLvl < 2.2) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item renderFormGroup" data-id="'+ item.ID + '" data-single="single" data-item="50">\
							Редактировать\
						</div>\
					';
					if (item.status && item.status != "reject") {
						menuColums += '\
							<div class="t-float-menu__item js-float-menu__item rejectGroup" data-event="delete" data-id="'+ item.ID + '" data-single="single" data-item="50">\
								Удалить\
							</div>\
						';
					}
					menuControl = true;
				}
				if (userAccessG.maxAccessLvl < 2.2 && !item.status) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item approveGroup" data-id="'+ item.ID + '" data-single="single" data-item="50">\
							Утвердить\
						</div>\
						<div class="t-float-menu__item js-float-menu__item rejectGroup" data-id="'+ item.ID + '" data-single="single" data-item="50">\
							Отклонить\
						</div>\
					';
					menuControl = true;
				}
				if (menuControl) {
					menu = '\
						<div class="t-float-menu js-float-menu">\
							<div class="t-float-menu__button js-float-menu__button">\
								<div class="s-icon s-icon-options"></div>\
							</div>\
							<div class="t-float-menu__list js-float-menu__list">\
								'+ menuColums + '\
							</div>\
						</div>\
					';
				}
				var avatar = (author.Avatar ? '/social/Avatars/' + author.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + author.PersonID);
				html = '\
					<div class="discussion-view">\
							<div class="description-block js-description-block">\
								<div class="description-block__meta">\
									<div class="description-block__meta-heading description-block__meta-heading_absolute">\
										<div class="description-block__name description-block__name_large js-description-block__post-name" data-edit="view">\
											<a href="/app-pages/forums/type.aspx?section=groups&target='+ item.ID + '" class="item_url">' + item.Title + '</a>\
											'+ (!item.status ? ' <div class="not-active__label"></div > ' : '') + '\
										</div>\
									</div>\
									<div class="description-block__meta-signature js-description-block__post-tag" data-edit="view">\
										<a \
											href="/app-pages/profile/type.aspx?user='+ author.uid + '&section=activity"\
											target="_blank"\
											class="g-profile "\
										>\
											<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (author.AvatarPos ? 'background-position: ' + author.AvatarPos + ';' : '') + '"></div>\
											<div>\
												<div>\
													<div>'+ author.Title + '</div>\
												</div>\
											</div>\
										</a>\
									</div>\
									<div class="description-block__meta-data">\
										' + tagsStr + '\
									</div>\
									'+ (item.annotation ? '<div class="description-block__content js-description-block__post-content" style="margin-top:10px;" data-edit="view">\
										<div class="g-content">\
											'+ item.annotation + '\
										</div>\
									</div>': '') + '\
									<div class="description-block__meta-info">\
										<div class="js-get-post-info-item_'+ item.ID + '"></div>\
										<div>' + item.Created.getTime().toDateRus(false) + '</div>\
									</div>\
									'+ (menuControl ? menu : '') + '\
								</div>\
							</div>\
					</div >\
				';
				$(container).append(html);
				$document.off('click', '.approveGroup').on('click', '.approveGroup', function () {
					var id = $(this).data('id');
					approveGroup(id).then(function (group) {
						TPL.restartRouter();
					})
				});
				$document.off('click', '.rejectGroup').on('click', '.rejectGroup', function () {
					var id = $(this).data('id');
					var event = $(this).data('event');
					rejectGroup(id, event).then(function (group) {
						TPL.restartRouter();
					})
				});
				$document.off('click', '.renderFormGroup').on('click', '.renderFormGroup', function () {
					var id = $(this).data('id');
					v.renderFormGroup(itemMapById[id]);
				});
			},
			columns: columns,
			inputContainer: '.js-search-input-container',
			outputContainer: tplsData.main.content,
			searchKey: 'search',
			// orderBy: orderBy,
			// ascending: ascending,
			// limit: 5,
			pageSize: 15,
			caml: caml,
			// orderByDate: true,
			// debugMode: true,
		});
	},
	renderMain: function (tplsData) {
		// console.log(tplsData);
		var itemMapById = {};
		var columns = ['Title'];
		searcherG && searcherG.destroy();
		searcherG = new Searcher(LIBRARY_G.Communities, {
			preRender: function (item, def) {
				var fields = {};
				var authorIds = [];
				for (var index = 0; index < item.length; index++) {
					authorIds.push(item[index].Author.get_lookupId());
				}
				m.getUsersADByUid(authorIds, { mapBy: 'uid' }).then(function (result) {
					fields.authors = result;
					def.resolve(fields);
				});
			},
			render: function (item, container, fields) {
				// console.log(item);
				// console.log(fields);
				var author = fields.authors[item.Author.get_lookupId()];
				// console.log(author);
				var menu = '';
				var menuColums = '';
				var menuControl = false;
				itemMapById[item.ID] = item;
				if (userAccessG.maxAccessLvl <= 1) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item communities-edit" data-uid="'+ item.ID + '" data-single="single" data-item="50">\
							Редактировать\
						</div>\
					';
					// if (item.status && item.status != "reject") {
					// 	menuColums += '\
					// 		<div class="t-float-menu__item js-float-menu__item rejectGroup" data-id="'+ item.ID + '" data-single="single" data-item="50">\
					// 			Удалить\
					// 		</div>\
					// 	';
					// }

					menuControl = true;
				}
				if (menuControl) {
					menu = '\
						<div class="t-float-menu js-float-menu">\
							<div class="t-float-menu__button js-float-menu__button">\
								<div class="s-icon s-icon-options"></div>\
							</div>\
							<div class="t-float-menu__list js-float-menu__list">\
								'+ menuColums + '\
							</div>\
						</div>\
					';
				}
				var avatar = (author.Avatar ? '/social/Avatars/' + author.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + author.PersonID);
				html = '\
					<div class="discussion-view">\
							<div class="description-block js-description-block">\
								<div class="description-block__meta">\
									<div class="description-block__meta-heading description-block__meta-heading_absolute">\
										<div class="description-block__name description-block__name_large js-description-block__post-name" data-edit="view">\
											<a href="/app-pages/forums/type.aspx?section=communities&target='+ item.ID + '" class="item_url">' + item.Title + '</a>\
										</div>\
									</div>\
									<div class="description-block__meta-signature js-description-block__post-tag" data-edit="view">\
										<a \
											href="/app-pages/profile/type.aspx?user='+ author.uid + '&section=activity"\
											target="_blank"\
											class="g-profile "\
										>\
											<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (author.AvatarPos ? 'background-position: ' + author.AvatarPos + ';' : '') + '"></div>\
											<div>\
												<div>\
													<div>'+ author.Title + '</div>\
												</div>\
											</div>\
										</a>\
									</div>\
									'+ (item.description ? '<div class="description-block__content js-description-block__post-content" style="margin-top:10px;" data-edit="view">\
										<div class="g-content">\
											'+ item.description + '\
										</div>\
									</div>': '') + '\
									<div class="description-block__meta-info">\
										<div class="js-get-post-info-item_'+ item.ID + '"></div>\
										<div>' + item.Created.getTime().toDateRus(false) + '</div>\
									</div>\
									'+ (menuControl ? menu : '') + '\
								</div>\
							</div>\
					</div >\
				';
				$(container).append(html);
				$('.communities-edit[data-uid="' + item.ID + '"]').click(function () {
					// console.log(item.ID);
					//m.getDataFromForms(item.ID, 'Communities').then(function (item) {
					// console.log(item);
					v.renderFormCommunities(item);
					//})
				})
			},
			columns: columns,
			inputContainer: '.js-search-input-container',
			outputContainer: tplsData.main.content,
			searchKey: 'search',
			// orderBy: orderBy,
			// ascending: ascending,
			// limit: 5,
			pageSize: 15,
			// caml: caml,
			// orderByDate: true,
			// debugMode: true,
		});
		$('.communities-edit').click(function () {
			// console.log(1111);

			var id = $(this).data('uid');
			// console.log(id);

			m.getDataFromForms(id, 'Communities').then(function (item) {
				// console.log(item);
				// v.renderFormCommunities(item);
			})
		})
	},
	renderGroups: function (tplsData, group) {
		var caml = 'Lookup group Eq ' + group.ID + ' And Boolean active Eq 1';
		if (userAccessG.maxAccessLvl < 2.2) caml = 'Lookup group Eq ' + group.ID;
		var columns = ['Title', 'annotation', 'tags', 'Author'];
		var itemMapById = {};
		var usersGroup = [];
		if (group) {
			if (group.length) group = group[0];
			if (group.users) {
				for (var index = 0; index < group.users.length; index++) {
					usersGroup.push(group.users[index].get_lookupId());
				}
			}
		}
		searcherG && searcherG.destroy();
		searcherG = new Searcher(LIBRARY_G.Discussions, {
			preRender: function (item, def) {
				// console.log(item);
				var fields = {};
				var authorIds = [];
				for (var index = 0; index < item.length; index++) {
					authorIds.push(item[index].Author.get_lookupId());
				}
				m.getUsersADByUid(authorIds, { mapBy: 'uid' }).then(function (result) {
					fields.authors = result;
					def.resolve(fields);
				});
			},
			render: function (item, container, fields) {
				// console.log(fields);
				var authorId = item.Author.get_lookupId();
				var author = fields.authors[authorId];
				var tagsStr = '';
				var menu = '';
				var menuColums = '';
				var menuControl = false;
				var accessHidden = true;
				var usersDiscussion = [];
				if (item.status == 'hidden') {
					accessHidden = false;
					if (item.users) {
						for (var index = 0; index < item.users.length; index++) {
							usersDiscussion.push(item.users[index].get_lookupId());
						}
						if (!~usersDiscussion.indexOf(authorId)) {
							usersDiscussion.push(authorId);
						}
					}
					if (~usersGroup.indexOf(userAccessG.userId) && ~usersDiscussion.indexOf(userAccessG.userId)) {
						accessHidden = true;
					}
				}
				itemMapById[item.ID] = item;
				if (item.tags) {
					for (var key in item.tags) {
						tagsValue = item.tags[key].get_lookupValue();
						tagsStr += '\
							<a class="navigator a-form__tag a-form__tag_base a-form__tag_link item_url" \
								href="/app-pages/forums/type.aspx?section=groups&target='+ group.ID + '&search=' + tagsValue + '">\
								' + tagsValue + '\
							</a>\
						';
					}
				}
				if (author.uid === DATA.user.id || userAccessG.maxAccessLvl < 2.5) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item renderFormDiscussion" data-id="'+ item.ID + '" data-single="single" data-item="50">\
							Редактировать\
						</div>\
					';
					menuControl = true;
				}
				if (userAccessG.maxAccessLvl < 2.5) {
					accessHidden = true;
					menuColums += '\
							<div class="t-float-menu__item js-float-menu__item rejectDiscussion" data-id="'+ item.ID + '" data-single="single" data-item="50">\
								Удалить\
							</div>\
					';
					menuControl = true;
				}
				if (menuControl) {
					menu = '\
						<div class="t-float-menu js-float-menu">\
							<div class="t-float-menu__button js-float-menu__button">\
								<div class="s-icon s-icon-options"></div>\
							</div>\
							<div class="t-float-menu__list js-float-menu__list">\
								'+ menuColums + '\
							</div>\
						</div>\
					';
				}
				// console.log(accessHidden);

				if (accessHidden) {
					var avatar = (author.Avatar ? '/social/Avatars/' + author.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + author.PersonID);
					html = '\
						<div class="discussion-view">\
							<div class="description-block js-description-block">\
								<div class="description-block__meta">\
									<div class="description-block__meta-heading description-block__meta-heading_absolute">\
										<div class="description-block__name description-block__name_large js-description-block__post-name" data-edit="view">\
											<a href="/app-pages/forums/type.aspx?section=discussions&target='+ item.ID + '" class="item_url">' + item.Title + '</a>\
											'+ (!item.active ? '<span style="color:#f67;">\
												- Удалено\
											</span>': '') + '\
										</div>\
									</div>\
									<div class="description-block__meta-signature js-description-block__post-tag" data-edit="view">\
										<a \
											href="/app-pages/profile/type.aspx?user='+ author.uid + '&section=activity"\
											target="_blank"\
											class="g-profile "\
										>\
											<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (author.AvatarPos ? 'background-position: ' + author.AvatarPos + ';' : '') + '"></div>\
											<div>\
												<div>\
													<div>'+ author.Title + '</div>\
												</div>\
											</div>\
										</a>\
									</div>\
									'+ (item.status == "hidden" ? ' <div class="item-meta_block">\
										<div class="item-meta__title">Статус:</div>\
										<div class="item-meta__value">Скрытое обсуждение</div>\
									</div>' : '') + '\
									<div class="description-block__meta-data">\
										' + tagsStr + '\
									</div>\
									'+ (item.annotation ? '<div class="description-block__content js-description-block__post-content" style="margin-top:10px;" data-edit="view">\
										<div class="g-content">\
											'+ item.annotation + '\
										</div>\
									</div>': '') + '\
									<div class="description-block__meta-info">\
										<div class="js-get-post-info-item_'+ item.ID + '"></div>\
										<div>' + item.Created.getTime().toDateRus(false) + '</div>\
									</div>\
									'+ (menuControl ? menu : '') + '\
								</div>\
							</div>\
						</div >\
					';
					$(container).append(html);
				}

				$document.off('click', '.renderFormDiscussion').on('click', '.renderFormDiscussion', function () {
					var id = $(this).data('id');
					v.renderFormDiscussion(itemMapById[id]);
				});
				$document.off('click', '.rejectDiscussion').on('click', '.rejectDiscussion', function () {
					var id = $(this).data('id');
					rejectDiscussion(id).then(TPL.restartRouter);
				});
				new Action(LIBRARY_G.Discussions, item.ID, '.js-get-post-info-item_' + item.ID, {
					author: item.Author.get_lookupId(),
					items: {
						emotion: { button: false, },
						comment: { save: true, },
						browsing: { save: false, },
					},
					notification: {
						case: 'feed',
						id: item.ID,
						to: item.Author.get_lookupId(),
						data: {
							id: item.ID,
							url: '/app-pages/forums/type.aspx?section=discussions&target=' + item.ID,
							post: item.Title,
						},
					},
				});
			},
			columns: columns,
			inputContainer: '.js-search-input-container',
			outputContainer: tplsData.main.content,
			searchKey: 'search',
			// orderBy: orderBy,
			// ascending: ascending,
			// limit: 5,
			pageSize: 15,
			caml: caml,
			// orderByDate: true,
			// debugMode: true,
		});
	},
	renderUserDiscussionWidget: function (tplsData, item) {
		var tplData = tplsData.userGroup;
		if (tplData) {
			var usersIds = [];
			if (item.users) {
				for (var index = 0; index < item.users.length; index++) {
					var userLookup = item.users[index];
					usersIds.push(userLookup.get_lookupId());
				}
			}
			// console.log(usersIds, userAccessG.userId);
			// if (DATA.user.id == 17591) debugger
			if (~usersIds.indexOf(+userAccessG.userId) || userAccessG.maxAccessLvl <= 2) {
				m.getUsersADByUid(usersIds).then(function (usersAd) {
					// console.log(usersAd);
					if (usersAd && usersAd.length) {
						var widgetHtml = '';
						tplData.content.append('<div class="widget-scroll"></div>');
						var $wingerBox = $document.find('.widget-scroll');
						for (var index = 0; index < usersAd.length; index++) {
							var userAD = usersAd[index];
							var avatar = (userAD.Avatar ? '/social/Avatars/' + userAD.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + userAD.PersonID);
							widgetHtml = '\
								<div class="user-group__box">\
									<a\
										href="/app-pages/profile/type.aspx?user='+ userAD.uid + '&section=activity"\
										target="_blank"\
										class="g-profile"\
									>\
										<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (userAD.AvatarPos ? 'background-position: ' + userAD.AvatarPos + ';' : '') + '"></div>\
										<div>\
											<div>\
												<div>'+ getFirstLastName(userAD.Title) + '</div>\
											</div>\
										</div>\
									</a>\
								</div>\
							';
							$wingerBox.append(widgetHtml);
						}
						widgetHtml += '';
					}
					var $menu = $(tplData.block).find('.t-float-menu__list.js-float-menu__list');
					var menuColums = '';
					var menuControl = false;
					if (userAccessG.maxAccessLvl < 2.5) {
						menuColums += '\
							<div class="t-float-menu__item js-float-menu__item controlUsersInDiscussion"\
								<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
									Управление участниками\
								</div>\
							</div>\
						';
						menuControl = true;
					}
					if (~usersIds.indexOf(+DATA.user.id)) {
						menuColums += '\
							<div class="t-float-menu__item js-float-menu__item deleteUserInDiscussion" data-group="'+ item.ID + '"\
								<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
									Отказаться от участия\
								</div>\
							</div>\
						';
						menuControl = true;
					}
					if (menuControl) {
						$menu.append(menuColums);
					}
					$('.deleteUserInDiscussion').click(function () {
						deleteUserInDiscussion(item);
					});
					$('.controlUsersInDiscussion').click(function () {
						v.controlUsersInDiscussion(item).then(function () {
							TPL.restartRouter();
						});
					});
				})
			} else {
				console.log(3333);

				TPL.locationError(403);
			}

		}
	},
	renderUserGroupWidget: function (tplsData, item) {
		// console.log(tplsData.userGroup, item);
		var tplData = tplsData.userGroup;
		if (tplData) {
			var usersIds = [];
			if (item.users) {
				for (var index = 0; index < item.users.length; index++) {
					var userLookup = item.users[index];
					usersIds.push(userLookup.get_lookupId());
				}
			}
			// console.log(usersIds);
			m.getUsersADByUid(usersIds, { mapBy: 'uid' }).then(function (usersAd) {
				// console.log(usersAd);
				if (usersAd && Object.keys(usersAd).length) {
					tplData.content.append('<div class="widget-scroll"></div>');
					var $wingerBox = tplData.content.find('.widget-scroll');
					// console.log($wingerBox);

					for (var key in usersAd) {
						if (usersAd.hasOwnProperty(key)) {
							var userAD = usersAd[key];
							var avatar = (userAD.Avatar ? '/social/Avatars/' + userAD.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + userAD.PersonID);
							var widgetHtml = '\
								<div class="user-group__box">\
									<a\
										href="/app-pages/profile/type.aspx?user='+ userAD.uid + '&section=activity"\
										target="_blank"\
										class="g-profile"\
									>\
										<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (userAD.AvatarPos ? 'background-position: ' + userAD.AvatarPos + ';' : '') + '"></div>\
										<div>\
											<div>\
												<div>'+ getFirstLastName(userAD.Title) + '</div>\
											</div>\
										</div>\
									</a>\
								</div>\
							';
							$wingerBox.append(widgetHtml);
						}
					}
					// if (DATA.user.id == 17591) {
					tplData.content.append('<div class="showMembers a-form__button a-form__button_color-1-2">Показать всех участников</div>');
					// }
					tplData.content.append('');
				} else {
					tplData.content.append('\
						<h3>Участников пока нет. <span class="community-active__user-group addUserInGroup" data-group="'+ item.ID + '">Станьте первым</span></h3>\
					');
				}
				var $menu = $(tplData.block).find('.t-float-menu__list.js-float-menu__list');
				var menuColums = '';
				var menuControl = false;
				if (userAccessG.maxAccessLvl < 2.5) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item controlUsersInGroup"\
							<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
								Управление участниками\
							</div>\
						</div>\
					';
					menuControl = true;
				}
				if (~usersIds.indexOf(+DATA.user.id)) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item deleteUserInGroup" data-group="'+ item.ID + '"\
							<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
								Отказаться от участия\
							</div>\
						</div>\
					';
					menuControl = true;
				} else {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item addUserInGroup" data-group="'+ item.ID + '"\
							<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
								Стать участником\
							</div>\
						</div>\
					';
					menuControl = true;
				}
				if (menuControl) {
					$menu.append(menuColums);
				}
				$('.addUserInGroup').click(function () {
					addUserInGroup(item);
				});
				$('.deleteUserInGroup').click(function () {
					deleteUserInGroup(item);
				});
				$('.controlUsersInGroup').click(function () {
					v.controlUsersInGroup(item).then(function () {
						TPL.restartRouter();
					});
				});
				$document.off('click', '.showMembers').on('click', '.showMembers', function () {
					var $this = $(this);
					// console.log($this);
					v.renderPopupStructureContent(item, usersAd);
				})
			})
		}
	},
	renderExpertGroupWidget: function (tplsData, item, userAccess) {
		// console.log(userAccess);

		// console.log(tplsData.userExperts, item);
		var tplData = tplsData.userExperts;
		if (tplData) {
			var usersIds = [];
			if (item.experts) {
				for (var index = 0; index < item.experts.length; index++) {
					var userLookup = item.experts[index];
					usersIds.push(userLookup.get_lookupId());
				}
			}
			// console.log(usersIds);
			m.getUsersADByUid(usersIds, { mapBy: 'uid' }).then(function (usersAd) {
				// console.log(usersAd);
				if (usersAd && Object.keys(usersAd).length) {
					// console.log(tplData.content);
					tplData.content.append('<div class="widget-scroll"></div>');
					var $wingerBox = tplData.content.find('.widget-scroll');
					// console.log($wingerBox);

					for (var key in usersAd) {
						if (usersAd.hasOwnProperty(key)) {
							var userAD = usersAd[key];
							var avatar = (userAD.Avatar ? '/social/Avatars/' + userAD.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + userAD.PersonID);
							var widgetHtml = '\
								<div class="user-group__box">\
									<a\
										href="/app-pages/profile/type.aspx?user='+ userAD.uid + '&section=activity"\
										target="_blank"\
										class="g-profile"\
									>\
										<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (userAD.AvatarPos ? 'background-position: ' + userAD.AvatarPos + ';' : '') + '"></div>\
										<div>\
											<div>\
												<div>'+ getFirstLastName(userAD.Title) + '</div>\
											</div>\
										</div>\
									</a>\
								</div>\
							';
							$wingerBox.append(widgetHtml);
						}
					}
					// if (DATA.user.id == 17591) {
					// tplData.content.append('<div class="showMembers a-form__button a-form__button_color-1-2">Показать всех участников</div>');
					// }
					tplData.content.append('');
				} else {

					if (userAccessG.maxAccessLvl < 2.3 && userAccess) {
						tplData.content.append('\
							<h3>Участников пока нет. Добавте через меню</h3>\
						');
					} else {
						tplData.block.remove();
					}
				}
				var $menu = $(tplData.block).find('.t-float-menu__list.js-float-menu__list');
				var menuColums = '';
				var menuControl = false;
				if (userAccessG.maxAccessLvl < 2.3 && userAccess) {
					menuColums += '\
						<div class="t-float-menu__item js-float-menu__item controlExpertsInGroup"\
							<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
								Управление участниками\
							</div>\
						</div>\
					';
					menuControl = true;
				}
				// if (~usersIds.indexOf(+DATA.user.id)) {
				// 	menuColums += '\
				// 		<div class="t-float-menu__item js-float-menu__item deleteUserInGroup" data-group="'+ item.ID + '"\
				// 			<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
				// 				Отказаться от участия\
				// 			</div>\
				// 		</div>\
				// 	';
				// 	menuControl = true;
				// } else {
				// 	menuColums += '\
				// 		<div class="t-float-menu__item js-float-menu__item addUserInGroup" data-group="'+ item.ID + '"\
				// 			<div class="t-float-menu__item js-float-menu__item" data-id="'+ item.ID + '" data-single="single" data-item="50">\
				// 				Стать участником\
				// 			</div>\
				// 		</div>\
				// 	';
				// 	menuControl = true;
				// }
				if (menuControl) {
					$menu.append(menuColums);
				}
				// $('.addUserInGroup').click(function () {
				// 	addUserInGroup(item);
				// });
				// $('.deleteUserInGroup').click(function () {
				// 	deleteUserInGroup(item);
				// });
				$('.controlExpertsInGroup').click(function () {
					v.controlUsersInGroup(item, 'experts').then(function () {
						TPL.restartRouter();
					});
				});
				$document.off('click', '.showMembers').on('click', '.showMembers', function () {
					var $this = $(this);
					// console.log($this);
					v.renderPopupStructureContent(item, usersAd);
				})
			})
		}
	},
	renderPopupStructureContent: function (data, usersAds) {
		// console.log(data);
		var def = $.Deferred();
		// console.log(active, item);
		var camlObject = {
			searchUser: '',
			shortPath: [],
			gender: '',
		};
		// console.log(usersAd);
		// console.log(data.users);

		if (data.users && Object.keys(usersAds).length) {
			var depts = [];
			for (var index = 0; index < data.users.length; index++) {
				var userUid = (data.users[index] ? data.users[index].get_lookupId() : false);
				if (userUid && usersAds[userUid].ShortPath) {
					var dept = usersAds[userUid].ShortPath.split(';')[0]
					if (!~depts.indexOf(dept)) depts.push(dept);
				}
			}
			var categoryForm = new AuraForm([
				{
					html: '\
							<div class="structure__information-head">\
								Участники '+ data.Title + '\
							</div>\
						'
				}, { hr: '' }, {
					html: '\
							<div class="voting-result__searcher"></div>\
						'
				}, { hr: '' }, {
					labeled: {
						label: 'Поиск сотрудника',
						required: false,
						uniqueName: 'searchUser',
						isValidateOnInput: true,
						// isValidateOnInput = true,
						isValidateOnBlur: false,
						// isValidateOnPaste = true,
						validator: function (text, cb) {
							searchUserHandler(text, camlObject);
							camlObject.searchUser = text;
							v.getSearcherUsers(searcherBox, data.users, usersAds, camlObject);
							cb(false);
						}
					}
				}, {
					dropList: {
						label: 'Предприятие',
						uniqueName: 'shortPath',
						multiSelect: true,
						required: false,
						placeholder: 'Выберите предприятие',
						class: 'vote-input__shortpath',
						values: depts,
						handler: function () {
							camlObject.shortPath = shortPathHandler();
							v.getSearcherUsers(searcherBox, data.users, usersAds, camlObject);
						},
						deleteHandler: function () {
							camlObject.shortPath = shortPathHandler();
							v.getSearcherUsers(searcherBox, data.users, usersAds, camlObject);
						},
					}
				}, {
					dropList: {
						label: 'Пол',
						required: false,
						uniqueName: 'gender',
						values: ['Любой', 'Мужской', 'Женский'],
						placeholder: 'Выберите пол',
						class: 'vote-input__gender',
						handler: function (column) {
							camlObject.gender = genderHandler(column);
							v.getSearcherUsers(searcherBox, data.users, usersAds, camlObject);
						},
					}
				}
			], false, {
				class: 'voting-results',
				//okTitle: 'Ок',
				confirmable: false,
			});

			var searcherBox = document.getElementsByClassName('voting-result__searcher');
			// console.log(searcherBox, users, usersAds, camlObject);

			v.getSearcherUsers(searcherBox, data.users, usersAds, camlObject);
			def.resolve();
			$('.voting-result__tags-box .a-form__tag_link').click(function () {
				var $this = $(this);
				if (!$this.hasClass("active")) {
					var id = $(this).data('id');
					$('.voting-result__tags-box .a-form__tag_link').each(function (i, el) {
						$(el).removeClass('active');
					});
					$this.addClass('active');
				}
			});
		}
	},
	getSearcherUsers: function (searcherBox, users, usersAds, camlObject) {
		// console.log(users);
		// console.log(camlObject);
		// console.log(usersAds);

		var camlResult = {};
		// console.log(camlObject.shortPath);
		var idsUsers = {};
		if (camlObject.shortPath.length) {
			camlResult.shortPath = 'Text ShortPath Contains ' + camlObject.shortPath;
		}
		if (camlObject.gender && camlObject.gender != 'Л') {
			camlResult.gender = 'Text Gender Contains ' + camlObject.gender;
		}
		if (camlObject.searchUser) {
			camlResult.searchUser = 'Text Title Contains ' + camlObject.searchUser;
		}
		if (users.length) {
			for (var index = 0; index < users.length; index++) {
				var user = users[index];
				// console.log(user);
				idsUsers[user.get_lookupId()] = true;
			}
		}
		idsUsers = Object.keys(idsUsers);
		// console.log(idsUsers);

		var caml = 'Number uid Eq ' + idsUsers;
		var count = 0;
		for (var key in camlResult) {
			if (camlResult.hasOwnProperty(key)) {
				count++;
				var str = camlResult[key];
				if (count >= 2) {
					caml = '(' + caml + ') And ' + str;
				} else if (caml) {
					caml = caml + ' And ' + str;
				}
			}
		}
		// console.log(caml);

		QUERY.getListItems('/AM/UsersAD', function (usersAd) {
			// console.log(usersAd);
			var html = '';
			$(searcherBox).empty();
			if (usersAd.length === 0 || !Object.keys(usersAds).length) {
				html = '<div class="empty_results">Пользователи по текущему запросу не найдены...</div>';
				$(searcherBox).append(html);
			} else {
				var usersIds = [];
				for (var index = 0; index < usersAd.length; index++) {
					var userAd = usersAd[index];
					// console.log(userAd);
					var user = usersAds[userAd.uid];
					// console.log(user);
					usersIds.push(user.uid);
					// console.log(user);
					var avatar = (user.Avatar ? '/social/Avatars/' + user.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + user.PersonID);
					html = '\
					<div class="labs-users__windet">\
						<a \
							href="/app-pages/profile/type.aspx?user='+ user.uid + '&section=activity"\
							target="_blank"\
							class="g-profile"\
						>\
							<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (user.AvatarPos ? 'background-position: ' + user.AvatarPos + ';' : '') + '"></div>\
							<div class="user-title" \
								'+ (!user.rank ? 'style="margin-top:15px"' : 'style="margin: 10px 0px 0px 49px;line-height: inherit;"') + '\
							>' + getFirstLastName(user.Title) + '</div>\
							'+ (user.rank ? '<div class="labs-rank">' + user.rank.get_lookupValue() + '</div>' : '') + '\
						</a>\
					</div>\
				';
					$(searcherBox).append(html);
				}
			}
			// console.log(usersIds);

			var height = 0;
			var windowsHeight = document.documentElement.clientWidth;
			var domArray = $('.voting-result__searcher').children();
			for (var index = 0; index < domArray.length; index++) {
				el = domArray[index];
				height += +$(el).height();
				if (windowsHeight - 700 < height) {
					break;
				}
			}
			$('.voting-result__searcher').css('height', height);
		}, {
			caml: caml,
		});
	},
	renderDiscussions: function (tplsData, item, group) {
		// console.log(item, group);
		var thisUser = DATA.user.id;
		var disabled = true;
		if (item && group) {
			var access = true;
			var groupUsers = [];
			var discussionUsers = [];
			var authorId = item.Author.get_lookupId();
			if (group.users) {
				for (var index = 0; index < group.users.length; index++) {
					var element = group.users[index];
					groupUsers.push(element.get_lookupId());
					if (element.get_lookupId() === thisUser) {
						disabled = false;
					}
				}
			}
			if (item.users) {
				for (var index = 0; index < item.users.length; index++) {
					var element = item.users[index];
					discussionUsers.push(element.get_lookupId());
				}
				if (!~discussionUsers.indexOf(authorId)) {
					discussionUsers.push(authorId);
				}
			}
			if (item.status && item.status == "hidden" && userAccessG.maxAccessLvl > 2.5) {
				access = false;
				if (~discussionUsers.indexOf(DATA.user.id) && ~groupUsers.indexOf(DATA.user.id)) {
					access = true;
				}
			}
			// console.log(access);
			// console.log(tplsData.materials);
			// console.log(item.materials);

			if (access) {
				if (tplsData.materials && item.materials && item.materials.length) {
					// console.log(2222);
					TPL.set({ main: 1 });
					v.renderWidgetMaterialsData(tplsData.materials, item);
				} else {
					if (userAccessG.maxAccessLvl < 2.2) {
						TPL.set({ main: 1 });
						tplsData.materials.content.append('<div class="empty-box">Материалы отсутствуют</div>');
					} else {
						tplsData.materials.block.remove();
						// if (item.status != 'hidden') {
						// 	TPL.set({ main: 1 });
						// }
					}
				}
				var defAuthor = $.Deferred();
				m.getUsersADByUid(authorId).then(defAuthor.resolve);
				defAuthor.then(function (author) {
					if (author.length) {
						author = author[0];
						// console.log(author);
						if (!group.active) item.active = false;
						// console.log(group);
						var tagsStr = '';
						if (item.tags) {
							for (var key in item.tags) {
								tagsValue = item.tags[key].get_lookupValue();
								tagsStr += '\
								<a class="navigator a-form__tag a-form__tag_base a-form__tag_link item_url" \
									href="/app-pages/forums/type.aspx?section=groups&target='+ group.ID + '&search=' + tagsValue + '">\
									' + tagsValue + '\
								</a>\
							';
							}
						}
						var avatar = (author.Avatar ? '/social/Avatars/' + author.Avatar : 'http://store-ex3.dme.aero.corp/Photo1/photo.aspx?TabelNumber=' + author.PersonID);
						var html = '\
							<div class="discussion-view">\
								<div class="description-block js-description-block">\
									<div class="description-block__meta">\
										<div class="description-block__meta-heading description-block__meta-heading_absolute">\
											<div class="description-block__name description-block__name_large js-description-block__post-name" data-edit="view">\
												'+ item.Title + '\
												'+ (!item.active ? '<span style="color:#f67;">\
													- Удалено\
												</span>': '') + '\
											</div>\
										</div>\
										<div class="description-block__meta-signature js-description-block__post-tag" data-edit="view">\
											<div>Автор:</div>\
											<a \
												href="/app-pages/profile/type.aspx?user='+ author.uid + '&section=activity"\
												target="_blank"\
												class="g-profile "\
											>\
												<div class="a-form__user-photo" style="background-image:url('+ avatar + ');' + (author.AvatarPos ? 'background-position: ' + author.AvatarPos + ';' : '') + '"></div>\
												<div>\
													<div>\
														<div>'+ author.Title + '</div>\
													</div>\
												</div>\
											</a>\
										</div>\
										'+ (item.status == "hidden" ? ' <div class="item-meta_block">\
											<div class="item-meta__title">Статус:</div>\
											<div class="item-meta__value">Скрытое обсуждение</div>\
										</div>' : '') + '\
										<div class="description-block__meta-data">\
											' + tagsStr + '\
										</div>\
										<div class="description-block__meta-info">\
											<div class="js-get-post-info-item"></div>\
											<div>' + item.Created.getTime().toDateRus(false) + '</div>\
										</div>\
									</div>\
									<div class="description-block__content js-description-block__post-content" data-edit="view">\
										<div class="g-content">\
											' + (item.description ? '\
												<div class="g-content__wrapper">\
													<h3 class="g-content__wrapper-h3">Обсуждаемый вопрос:</h3>\
													<div>\
														'+ item.description + '\
													</div>\
												</div>\
											' : '') + '\
										</div>\
									</div>\
									<div class="description-block__meta description-block__meta_bottom">\
										<div class="description-block__meta-info">\
											<div class="js-get-post-info-item"></div>\
											<div>' + item.Created.getTime().toDateRus(false) + '</div>\
										</div>\
									</div>\
									<div class="community-active '+ (disabled ? 'comments-disabled' : '') + '">\
										'+ (disabled ? '<div class="discussion-blockquote"><blockquote>\
											<h3>\
												Комментирование разрешено только участникам группы "'
								+ (group ? group.Title : '') +
								'", которой принадлежит это обсуждение. \
												<span class="community-active__user-group addUserInGroup" data-group="'+ group.ID + '">Станьте участником группы</span>, чтобы оставить комментарий.</h3>\
											</blockquote></div>': '') + '\
										<div class="js-get-comment"></div>\
									</div>\
								</div>\
							</div>\
						';
						tplsData.disscution.content.append(html);
						new Action(LIBRARY_G.Discussions, item.ID, '.js-get-post-info-item', {
							author: item.Author.get_lookupId(),
							items: {
								emotion: { button: true, },
								comment: { save: true, },
								browsing: { save: true, },
							},
							notification: {
								case: 'feed',
								id: item.ID,
								to: item.Author.get_lookupId(),
								data: {
									id: item.ID,
									url: '/app-pages/forums/type.aspx?section=discussions&target=' + item.ID,
									post: item.Title,
								},
							},
						});
						// if (false) {
						$('.addUserInGroup').click(function () {
							addUserInGroup(group);
						});
						// if (DATA.user.id == 17591) {
						// console.log(author.uid);

						new Comments(LIBRARY_G.Discussions, item.ID, '.js-get-comment', {
							preview: false,
							fixation: true,
							fixationMenu: (author.uid == DATA.user.id || userAccessG.maxAccessLvl <= 1 ? true : false), //(author.uid == userAccessG.userId || userAccessG.maxAccessLvl <= 1 ? true : false), 
							disabled: disabled,
							isQuestions: disabled,
							nesting: 3,
							notification: {
								case: 'feed',
								id: item.ID,
								to: item.Author.get_lookupId(),
								data: {
									type: 'feed',
									id: item.ID,
									url: '/app-pages/forums/type.aspx?section=discussions&target=' + item.ID,
									post: item.Title,
								},
							}
						});

						// Timmi >>>
						// Слайдер
						$('.g-content').find('img').each(function () {
							var context = $(this);
							context.attr({
								'data-workspace': 'call',
								'data-src': context.attr('src'),
								'data-group': 'feed',
								'data-type': 'browsing'
							});
						});
						// Timmi <<<


						// } else {
						// 	new Comments(LIBRARY_G.Discussions, item.ID, '.js-get-comment', {
						// 		preview: false,
						// 		// fixation: true,
						// 		disabled: disabled,
						// 		isQuestions: disabled,
						// 		nesting: 3,
						// 		notification: {
						// 			case: 'feed',
						// 			id: item.ID,
						// 			to: item.Author.get_lookupId(),
						// 			data: {
						// 				type: 'feed',
						// 				id: item.ID,
						// 				url: '/app-pages/forums/type.aspx?section=discussions&target=' + item.ID,
						// 				post: item.Title,
						// 			},
						// 		}
						// 	});
						// }
					}
				})
			} else {
				console.log(55555);

				TPL.locationError(403);
			}
		}
	},
	renderWidgetMaterialsData: function (data, item, active, modeForm) {
		// console.log(data, item, active, modeForm);
		if (modeForm) {
			// console.log(active);
			new AuraForm([
				{
					html: '<div class="popup_material__widget">\
						<div class="popup-material__titles"></div>\
						<div class="popup-material__border"></div>\
						<div class="popup-material__contents animate"></div>\
					</div>',
				}
			], false, {
				confirmable: false,
			});
			var height = 0;
			var titleHtml = '';
			var $widgetBoxTitle = $('.popup-material__titles');
			var $widgetBoxContent = $('.popup-material__contents');
			if (item.presentation && item.presentation.length) {
				titleHtml += '<div class="popup-materials__title' + (active == "presentation" ? ' active' : '') + '"  data-selector="presentation">Презентации<span class="popup-materials__count"> (' + item.presentation.length + ')</span></div>';
			}
			if (item.protocol && item.protocol.length) {
				titleHtml += '<div class="popup-materials__title' + (active == "protocol" ? ' active' : '') + '"  data-selector="protocol">Протоколы<span class="popup-materials__count"> (' + item.protocol.length + ')</span></div>';
			}
			if (item.materials && item.materials.length) {
				titleHtml += '<div class="popup-materials__title' + (active == "materials" ? ' active' : '') + '"  data-selector="materials">Материалы<span class="popup-materials__count"> (' + item.materials.length + ')</span></div>';
			}
			if (item.other && item.other.length) {
				titleHtml += '<div class="popup-materials__title' + (active == "other" ? ' active' : '') + '"  data-selector="other">Другое<span class="popup-materials__count"> (' + item.other.length + ')</span></div>';
			}
			$widgetBoxTitle.append(titleHtml);

			$document.off('click', '.popup-materials__title').on('click', '.popup-materials__title', function () {
				var $this = $(this);
				var selector = $this.data('selector');
				$('.popup-materials__title').each(function (id, el) {
					$(el).removeClass('active');
				});
				$this.addClass('active');
				$widgetBoxContent.css({ height: $widgetBoxContent.height() });
				// console.log($widgetBoxContent.height());
				renderMaterialsItems($widgetBoxContent, item[selector]);
			});
			renderMaterialsItems($widgetBoxContent, item[active]);
			function renderMaterialsItems(data, items) {
				data.empty();
				var def = $.Deferred();
				// console.log(data, items);
				var ids = [];
				var html = '';
				for (var index = 0; index < items.length; index++) {
					ids.push(items[index].get_lookupId());
				}
				m.getMaterials({ caml: 'ID Eq ' + ids }).then(function (materials) {
					// console.log(materials);
					// materials = materials.concat(materials);
					var image_type = ['png', 'jpg', 'jpeg'];
					for (var index = 0; index < materials.length; index++) {
						var material = materials[index];
						var MB = Math.round((+material['File_x0020_Size']) / 1024 / 1024 * 100) / 100;
						if (image_type.indexOf(material['File_x0020_Type'].toLowerCase()) != -1) {
							html += '\
								<div class="material-item__box">\
										<div class="material-item__url"\
											alt="'+ material.Title + '"\
											data-type="browsing"\
											data-workspace="call" \
											data-src="' + material.FileRef + '" \
											data-group="ImageFILE" \
											data-id="' + material.ID + '"\
										>\
											<div class="material-item__title">'+ material.Title + '</div>\
											<div class="material-item__size">'+ MB + ' Мб</div>\
											<div class="material-item__time">'+ material.Created.getTime().toDateRus(true) + '</div>\
										</div>\
										'+ (userAccessG.maxAccessLvl < 2 ? '<div class="material-item__delete" data-id="' + material.ID + '">x</div>' : '') + '\
								</div>\
							';
						} else {
							html += '\
								<div class="material-item__box">\
									<a class="material-item__url" target="_blank" href="'+ material.FileRef + '">\
										<div class="material-item__title">'+ material.Title + '</div>\
										<div class="material-item__size">'+ MB + ' Мб</div>\
										<div class="material-item__time">'+ material.Created.getTime().toDateRus(true) + '</div>\
									</a>\
									'+ (userAccessG.maxAccessLvl < 2 ? '<div class="material-item__delete" data-id="' + material.ID + '">x</div>' : '') + '\
								</div>\
							';
						}
					}
					data.append(html);
					height = 0;
					data.children().each(function (id, el) {
						height += + $(el).height() + 20;
					});
					$document.off('click', '.material-item__delete').on('click', '.material-item__delete', function () {
						var $this = $(this);
						var $parent = $this.parents('.material-item__box');
						var id = $this.data('id');
						m.deleteMaterialByID(id).then(function () {
							$parent.slideUp(300);
							height = height - 41;
							data.css({ height: height });
						})
					})
					data.css({ height: height });
					def.resolve();
				});
				return def;
			}
		} else {
			data.content.empty();
			var html = '<div class="materials__box">';
			if (item.presentation && item.presentation.length) {
				html += '<div class="materials-event" data-active="presentation">Презентации</div>';
			}
			if (item.protocol && item.protocol.length) {
				html += '<div class="materials-event" data-active="protocol">Протоколы</div>';
			}
			if (item.materials && item.materials.length) {
				html += '<div class="materials-event" data-active="materials">Документы</div>';
			}
			if (item.other && item.other.length) {
				html += '<div class="materials-event" data-active="other">Другое</div>';
			}
			html += '</div>';
			data.content.append(html);
			$document.off('click', '.materials-event').on('click', '.materials-event', function () {
				var active = $(this).data('active');
				v.renderWidgetMaterialsData(data, item, active, true);
			});
		}
	},
	renderFormCommunities: function (item) {
		// console.log(item);
		var formInputs = [
			{
				title: (item ? 'Настройки профессионального форума' : 'Создать новое сообщество'),
			}, {
				labeled: {
					label: 'Заголовок профессионального форума',
					uniqueName: 'title',
					value: (item && item.Title ? item.Title : ''),
				}
			}, {
				text: {
					label: 'Аннотация',
					uniqueName: 'description',
					value: (item && item.description ? item.description : ''),
					// required: false,
				}
			}, {
				labeled: {
					label: 'Ссылка на сообщество',
					uniqueName: 'url',
					value: (item && item.url ? item.url : ''),
					// required: false,
				}
			}

		]
		new AuraForm(formInputs, function (result) {
			// console.log(result);
			var inputs = {
				Title: result.title,
				description: result.description,
				url: result.url,
			}
			if (item) {
				inputs.ID = item.ID;
				m.updateCommunities(inputs).then(function () {
					new AuraForm([
						{
							title: 'Обновление сообщества',
						}, {
							html: 'Сообщество "' + item.Title + '" обновлено',
						}
					], function () {
						TPL.restartRouter();
					});
				});
			} else {
				m.createCommunities(inputs).then(function () {
					new AuraForm([
						{
							title: 'Создать новое сообщество',
						}, {
							html: 'Сообщество успешно создано!',
						}
					], function () {
						TPL.restartRouter();
					});
				}).fail(function () {
					console.warn('Произошла ошибка записи в базу, функцией createCommunities!')
				});
			}
		})
	},
	renderFormGroup: function (item) {
		var def = $.Deferred();
		var defModerator = $.Deferred();
		var member = [];
		if (item && item.users) {
			for (var index = 0; index < item.users.length; index++) {
				var user = item.users[index];
				member.push(user.get_lookupId());
			}
		}
		var formInputs = [
			{
				title: (item ? 'Редактировать' : 'Создать новую') + ' группу',
			}, {
				labeled: {
					label: 'Название группы',
					uniqueName: 'title',
					value: (item && item.Title ? item.Title : ''),
				}
			}, {
				labeled: {
					label: 'Краткая аннотация',
					uniqueName: 'annotation',
					value: (item && item.annotation ? item.annotation : ''),
				}
			}, {
				text: {
					label: 'Описание группы',
					uniqueName: 'description',
					value: (item && item.description ? item.description : ''),
				}
			}, {
				tags: {
					uniqueName: 'tags',
					label: 'Теги',
					listData: LIBRARY_G.Group,
					active: (item && item.tags ? item.tags : ''),
					required: true,
				}
			}, {
				lookupUsers: {
					label: (item ? 'Участники' : 'Предполагаемые участники'),
					uniqueName: 'users',
					required: false,
					users: (item && item.users ? item.users : ''),
				}
			}
		];
		if (item) {
			var options = {
				caml: 'Lookup groups Eq ' + item.ID + ' And active Eq 1',
			}
			m.getUsersAccessSection(options).then(function (items) {
				if (items) {
					var usersIds = [];
					for (var index = 0; index < items.length; index++) {
						var item = items[index];
						usersIds.push(item.user.get_lookupId());
					}
				}
				formInputs.push({
					lookupUsers: {
						label: 'Модератор группы',
						uniqueName: 'moderator',
						// required: false,
						users: (usersIds ? usersIds : ''),
						limit: 1,
					}
				});
				defModerator.resolve();
			})

		} else {
			defModerator.resolve();
		}
		defModerator.then(function () {
			var form = new AuraForm(formInputs, function (result) {
				// console.log(result);
				var usersIds = [];
				if (result.users) {
					for (var index = 0; index < result.users.length; index++) {
						var user = result.users[index];
						usersIds.push(user.id);
					}
				}
				var inputs = {
					Title: result.title,
					description: result.description,
					tags: result.tags.tagIds,
					users: usersIds,
					annotation: result.annotation,
				};
				var inputsModer = {
					Title: 'moderator',
					name: 'Модератор группы',
					active: 1,
					access: '2.222',
				}
				if (item) {
					inputs.ID = item.ID;
					inputs.community = item.community;
					inputs.active = item.active;
					inputs.moderator = result.moderator[0].id;
					var usersControl = diff(member, usersIds);
					sendMailEditGroupUsers(usersControl.add, usersControl.delete, item);
					m.updateGroups(inputs).then(function (spItem, id, group) {
						if (group) group = group[0];
						new AuraForm([
							{
								title: 'Обновление группы',
							}, {
								html: 'Группа "' + item.Title + '" обновлена',
							}
						], function () {
							TPL.restartRouter();
						});
						if (result.moderator) {
							inputsModer.user = result.moderator[0].id;
							// console.log(inputsModer);
							var options = {
								caml: 'Lookup groups Eq ' + item.ID + ' And Title Eq moderator',
							}
							m.getUsersAccessSection(options).then(function (userItems) {
								var userItem = userItems[0];
								if (!userItem) {
									// inputsModer.user = DATA.user.id;
									inputsModer.groups = item.ID;
									m.createUserAccess(inputsModer).then(function () {
										// console.log(group, userItem);
										def.resolve(group);
									});
								} else {
									inputsModer.ID = userItem.ID;
									inputsModer.groups = item.ID;
									m.updateUserAccess(inputsModer).then(function () {
										// console.log(group, userItem); // userItem.user - был модератором, group.moderator - стал
										sendModeratorMails(userItem.user, group.moderator, group).then(def.resolve);
									});
								}
								// console.log(userItem);
							})
						} else {
							def.resolve(group);
						}
					});
				} else {
					inputs.active = false;
					inputs.moderator = DATA.user.id;
					inputs.community = uriG.query.target;
					m.createGroups(inputs).then(function (sp, id, item) {
						inputsModer.user = DATA.user.id;
						inputsModer.groups = item[0].ID;
						// console.log(inputsModer);
						m.createUserAccess(inputsModer).then(function () {
							new AuraForm([
								{
									title: 'Создать новую группу',
								}, {
									html: 'Ваша заявка на создание новой группы направлена модераторам профессионального форума. Уведомление с результатом рассмотрения придет на вашу электронную почту. Благодарим за участие в развитии профессиональных сообществ в Ауре',
								}
							], function () {
								def.resolve(item);
							});

						});

					});

				}
			}, {
				okTitle: (item ? 'Редактировать' : 'Отправить на рассмотрение'),
			})
		})
		return def;
	},
	renderFormDiscussion: function (item) {
		var usersIds = [];
		if (item && item.users) {
			for (var index = 0; index < item.users.length; index++) {
				var user = item.users[index];
				usersIds.push(user.get_lookupId());
			}
		}
		var formInputs = [
			{
				title: (item ? 'Редактировать' : 'Создать новое') + ' обсуждение',
			}, {
				labeled: {
					label: 'Название обсуждения',
					uniqueName: 'title',
					value: (item && item.Title ? item.Title : ''),
				}
			}, {
				labeled: {
					label: 'Краткая аннотация',
					uniqueName: 'annotation',
					value: (item && item.annotation ? item.annotation : ''),
				}
			}, {
				text: {
					label: 'Обсуждаемый вопрос',
					uniqueName: 'description',
					value: (item && item.description ? item.description : ''),
				}
			}, {
				tags: {
					uniqueName: 'tags',
					label: 'Теги',
					listData: LIBRARY_G.Discussions,
					active: (item && item.tags ? item.tags : ''),
					required: true,
				}
			}, {
				checkBox: {
					label: 'Скрытое',
					uniqueName: 'hidden',
					value: (item ? (item.status == 'hidden' ? true : false) : false),
					class: 'check-descussion',
					handler: function (check) {
						if (check) {
							showUsersInHiddenDescussion($usersInput);
						} else {
							$usersInput.css({ height: 0, opacity: 0 });
						}
					}
				}
			}, {
				html: {
					uniqueName: 'label__check-descussion',
					value: '\
							<div style="margin-top:10px">\
								<span style="color:#e64;margin-right:10px">*</span>\
								<span>Просматривать и учавствовать в скрытом обсуждении смогут только сотрудники, которых вы выберите в появившемся ниже поле.</span>\
							</div>\
						',
				}
			}, {
				lookupUsers: {
					uniqueName: 'users',
					users: (usersIds.length ? usersIds : ''),
					required: false,
					class: 'hidden users-descussions',
					handler: function () {
						showUsersInHiddenDescussion($usersInput);
					},
					deleteHandler: function () {
						showUsersInHiddenDescussion($usersInput);
					}
				}
			}
		]
		var form = new AuraForm(formInputs, function (result) {
			// console.log(result);
			var usersIdsRes = [];
			if (result.users) {
				for (var index = 0; index < result.users.length; index++) {
					var element = result.users[index];
					usersIdsRes.push(element.id);
				}
			}
			var inputs = {
				Title: result.title,
				description: result.description,
				tags: result.tags.tagIds,
				annotation: result.annotation,
				users: usersIdsRes,
				status: (result.hidden ? 'hidden' : ''),
			}
			if (item) {
				inputs.ID = item.ID;
				// console.log(inputs);
				m.updateDiscussions(inputs).then(function (sp, id, discussion) {
					// console.log(discussion);
					updateGroupUsersByHiddenDiscussion(discussion, false, usersIds);
					new AuraForm([
						{
							title: 'Обновление группы',
						}, {
							html: 'Обсуждение "' + item.Title + '" обновлено',
						}
					], function () {
						TPL.restartRouter();
					});
				});
			} else {
				inputs.group = uriG.query.target;
				m.createDiscussions(inputs).then(function (sp, id, item) {
					if (item) {
						if (item.length) item = item[0];
						m.getGroups({ caml: 'ID Eq ' + item.group.get_lookupId() }).then(function (group) {
							if (group) {
								if (group.length) group = group[0];
								// console.log(group, item, group.community.get_lookupId());

								if (group.community) {
									m.updateDiscussions({ ID: item.ID, community: group.community.get_lookupId() });
								}
								var groupUsersIds = [];
								updateGroupUsersByHiddenDiscussion(item, group, usersIds);
								if (group.users) {
									for (var index = 0; index < group.users.length; index++) {
										var groupUserId = group.users[index].get_lookupId();
										groupUsersIds.push(groupUserId);
									}
								}
								m.getUsersAD({ caml: 'Number uid Eq ' + groupUsersIds + ' And Boolean isActive Eq 1' }).then(function (users) {
									var ids = [];
									if (users && users.length) {
										for (var i = 0; i < users.length; i++) {
											var user = users[i];
											ids.push(user.uid);
										}
									}
									var to = ids;
									var theme = 'В группе «' + group.Title + '» создано новое обсуждение.';
									var body = '\
										<p>\
											Добрый день. В группе «' + group.Title + '» в профессиональном форуме «' + group.community.get_lookupValue() + '» создано новое обсуждение.\
										</p>\
										<p>\
											Тема обсуждения:<br>\
											<b>'+ item.Title + '</b>\
										</p>\
										<p>\
											Чтобы принять участие в обсуждении, перейдите <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=discussions&target='+ item.ID + '"> по этой ссылке</a>\
										</p>\
										<p>\
											Благодарим за развитие профессиональных сообществ в Ауре.\
										</p>\
									';
									new Mail(['aura'], to, theme, body, false, {
										template: true,
										send: MAILS_SEND_G,
									});
								});
							}
						});
					}
					new AuraForm([
						{
							title: 'Создать новое обсуждение',
						}, {
							html: 'Новое обсуждение создано. Уведомления отправлены участникам группы. Благодарим за участие в развитии профессиональных сообществ в Ауре',
						}
					], function () {
						TPL.restartRouter();
					});
				});
			}
		}, {
			okTitle: (item ? 'Редактировать' : 'Создать'),
		});

		var $check = $('.check-descussion');
		var $usersInput = $('.users-descussions');
		if ($check.find('input').prop("checked")) {
			showUsersInHiddenDescussion($usersInput);
		}
		function showUsersInHiddenDescussion($usersInput) {
			$usersInput.css({ height: 'auto', opacity: 1 });
		}
		function updateGroupUsersByHiddenDiscussion(discussion, group, oldUsers) {
			var def = $.Deferred();
			if (discussion) {
				if (discussion.length) discussion = discussion[0];
				if (discussion.status == "hidden" && discussion.users) {
					var defGroup = $.Deferred();
					if (!group) {
						m.getGroups({ caml: 'ID Eq ' + discussion.group.get_lookupId() }).then(defGroup.resolve);
					} else {
						defGroup.resolve(group);
					}
					defGroup.then(function (groups) {
						if (groups) {
							if (groups.length) groups = groups[0];
							var usersGroup = [];
							var usersDiscussion = [];
							if (groups.users && discussion.users) {
								for (var index = 0; index < groups.users.length; index++) {
									var userGroup = groups.users[index].get_lookupId();
									usersGroup.push(userGroup);
								}
								for (var index = 0; index < discussion.users.length; index++) {
									var userDiscussion = discussion.users[index].get_lookupId();
									usersDiscussion.push(userDiscussion);
									if (!~usersGroup.indexOf(userDiscussion)) {
										usersGroup.push(userDiscussion);
									}
								}
								// console.log(oldUsers, usersGroup);

								var usersControl = diff(oldUsers, usersDiscussion);
								// console.log(usersControl);
								sendMailEditDiscussionUsers(usersControl.add, usersControl.delete, discussion)
								m.updateGroups({ users: usersGroup, ID: groups.ID }).then(function (spItem, id, groupUpdate) {
									if (groupUpdate) {
										if (groupUpdate.length) groupUpdate = groupUpdate[0];
									}
									// m.updateGroups({ users: usersUpdate, ID: item.ID }).then(def.resolve);
									// var to = usersDiscussion;
									// var theme = 'Вы стали участником скрытого обсуждения «' + discussion.Title + '».';
									// var body = '\
									// 	<p>\
									// 		Добрый день.Вы стали участником скрытого обсуждения «' + discussion.Title + '» в группе «' + groups.Title + '».\
									// 	</p>\
									// 	<p>\
									// 		Чтобы принять участие в обсуждении, перейдите <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=discussions&target='+ discussion.ID + '"> по этой ссылке</a>\
									// 	</p>\
									// 	<p>\
									// 		Благодарим за развитие профессиональных сообществ в Ауре.\
									// 	</p>\
									// ';
									// new Mail(['aura'], to, theme, body, false, {
									// 	template: true,
									// 	send: MAILS_SEND_G,
									// });
									def.resolve(groupUpdate);
								});
							} else {
								def.reject();
							}
						} else {
							def.reject();
						}
					});
				} else {
					def.reject();
				}
			} else {
				def.reject();
			}
			return def;
		}
	},
	absoluteAddForm: function (item) {
		// console.log(item);
		var def = $.Deferred();
		var absolute = {
			usersIds: [],
			items: [],
			itemsDel: [],
			itemsCreate: [],
		};
		var caml = 'Text Title Eq absolute-forum And Lookup communities Eq ' + item.ID;
		m.getUsersAccessSection({ caml: caml }).then(function (users) {
			for (var index = 0; index < users.length; index++) {
				var user = users[index];
				absolute.items.push(user);
				absolute.itemsDel.push(user.ID);
				absolute.usersIds.push(users[index].user.get_lookupId());
			}
			new AuraForm([{
				title: 'Модератор ПФ'
			}, {
				lookupUsers: {
					uniqueName: 'absolute',
					users: (absolute.usersIds.length ? absolute.usersIds : ''),
					required: false
				}
			}], function (results) {
				// console.log(absolute);
				var defCreate = $.Deferred();
				var defDelete = $.Deferred();
				// console.log(results.absolute);
				if (results.absolute) {
					for (var i = 0; i < results.absolute.length; i++) {
						var userAbsolute = results.absolute[i];
						var index = absolute.usersIds.indexOf(userAbsolute.id);
						if (index === -1) {
							var formInputs = {
								Title: 'absolute-forum',
								name: 'Модератор ПФ',
								access: "2.100",
								user: userAbsolute.id,
								active: true,
								communities: item.ID,
							};
							absolute.itemsCreate.push(formInputs);
							void function (i) {
								m.createUserAccess(formInputs).then(function () {
									if (results.absolute.length - 1 == i) {
										defCreate.resolve();
									}
								});
							}(i)

						} else {
							absolute.itemsDel.splice(index, 1);
							if (results.absolute.length - 1 == i) {
								defCreate.resolve();
							}
						}
					}
				} else {
					defCreate.resolve();
				}
				if (absolute.itemsDel.length) {
					QUERY.deleteListItem(LIBRARY_G.AccessUsers, absolute.itemsDel, defDelete.resolve);
				} else {
					defDelete.resolve();
				}
				$.when(defCreate, defDelete).then(def.resolve);
			}, {
				okTitle: 'Сохранить'
			});
		})
		return def;
	},
	controlUsersInGroup: function (item, field) {
		var def = $.Deferred();
		if (!field) field = 'users';
		if (item) {
			var usersIds = [];
			if (item && item[field]) {
				for (var index = 0; index < item[field].length; index++) {
					var user = item[field][index];
					usersIds.push(user.get_lookupId());
				}
			}
			new AuraForm([{
				title: 'Управление участниками'
			}, {
				lookupUsers: {
					uniqueName: 'users',
					users: (usersIds.length ? usersIds : ''),
					required: false
				}
			}], function (results) {
				// console.log(results);
				var usersUpdate = [];
				var inputs = {};
				if (results.users) {
					for (var index = 0; index < results.users.length; index++) {
						var user = results.users[index];
						usersUpdate.push(user.id);
					}
				}
				var usersControl = diff(usersIds, usersUpdate);
				if (field == 'users') {
					sendMailEditGroupUsers(usersControl.add, usersControl.delete, item);
				}
				inputs[field] = usersUpdate;
				inputs.ID = item.ID;
				m.updateGroups(inputs).then(def.resolve);
			}, {
				okTitle: 'Сохранить'
			});
		} else {
			def.reject();
		}
		return def;
	},
	controlUsersInDiscussion: function (item) {
		var def = $.Deferred();
		if (item) {
			var usersIds = [];
			if (item && item.users) {
				for (var index = 0; index < item.users.length; index++) {
					var user = item.users[index];
					usersIds.push(user.get_lookupId());
				}
			}
			new AuraForm([{
				title: 'Управление участниками'
			}, {
				lookupUsers: {
					uniqueName: 'users',
					users: (usersIds.length ? usersIds : ''),
					required: false
				}
			}], function (results) {
				// console.log(results);
				var usersUpdate = [];
				if (results.users) {
					for (var index = 0; index < results.users.length; index++) {
						var user = results.users[index];
						usersUpdate.push(user.id);
					}
				}
				var usersControl = diff(usersIds, usersUpdate);
				// console.log(usersControl);

				sendMailEditDiscussionUsers(usersControl.add, usersControl.delete, item);
				m.updateDiscussions({ users: usersUpdate, ID: item.ID }).then(def.resolve);
			}, {
				okTitle: 'Сохранить'
			});
		} else {
			def.reject();
		}
		return def;
	},
	controlMaterialsForm: function (item) {
		var def = $.Deferred();
		// console.log(item, type);
		var name = 'Другое';
		new AuraForm([{
			title: 'Материалы',
		}, {
			file: {
				label: 'Вложения',
				listData: LIBRARY_G.Materials,
				uniqueName: 'materials',
				isMultiple: true,
				byName: false,
				required: false,
				value: (item ? item.materials : ''),
			}
		}], function (results) {
			// console.log(results);
			var filesIdArr = [];
			var inputsFile = [];
			if (results.materials) {
				for (var key in results.materials) {
					var file = results.materials[key];
					filesIdArr.push(file.ID);
					inputsFile.push({
						fileTitle: file.columns.Title,
						ID: file.ID,
					});
				}
			}
			// console.log(filesIdArr, inputsFile);
			if (inputsFile.length) {
				m.updateMaterials(inputsFile).then(function () {
					def.resolve(filesIdArr);
				});
			} else {
				def.resolve(filesIdArr);
			}
		});
		return def;
	},
}
//  =============================================================================
//  ===========  ====  ==        ==    ==  ========    ==        ==  ====  ======
//  ===========  ====  =====  ======  ===  =========  ======  =====   ==   ======
//  ===========  ====  =====  ======  ===  =========  ======  ======  ==  =======
//  ===========  ====  =====  ======  ===  =========  ======  ======  ==  =======
//  ===========  ====  =====  ======  ===  =========  ======  =======    ========
//  ===========  ====  =====  ======  ===  =========  ======  ========  =========
//  ===========  ====  =====  ======  ===  =========  ======  ========  =========
//  ===========   ==   =====  ======  ===  =========  ======  ========  =========
//  ============      ======  =====    ==        ==    =====  ========  =========
//  =============================================================================

function getAccess(communityId, groupId) {
	var access;
	var groupAccess;
	var communityAccess;
	if (communityId) {
		try {
			communityAccess = (~userAccessG.userAccess['absolute-forum'].communities.indexOf(communityId) ? true : false);
		} catch (error) {
			communityAccess = false;
		}
	} else {
		communityAccess = false;
	}
	if (groupId) {
		try {
			groupAccess = (~userAccessG.userAccess.moderator.groups.indexOf(groupId) ? true : false);
		} catch (error) {
			groupAccess = false;
		}
	} else {
		groupAccess = false;
	}
	access = (communityAccess || groupAccess || userAccessG.maxAccessLvl <= 1) ? true : false;
	return access;
}
function addUserInGroup(group) {
	// console.log(group);
	var id = group.ID;
	if (id) {
		m.controlUserInGroup(id).then(function (sp, id, item) {
			if (item) item = item[0];
			sendMailEditGroupUsers([DATA.user.id], false, item);
			new AuraForm([
				{
					title: 'Участие в профессиональном форуме',
				}, {
					html: 'Поздравляем, вы стали участником группы: "' + group.Title + '". Благодарим за развитие профессиональных сообществ в Ауре.',
				}
			], function () {
				TPL.restartRouter();
			});
		});
	}
}
function deleteUserInGroup(group) {
	var id = group.ID;
	if (id) {
		new AuraForm([
			{
				title: 'Отказ от участия в группе',
			}, {
				labeled: {
					label: 'Причина',
					uniqueName: 'reason',
				}
			},
		], function (result) {
			// console.log(result);
			if (result.reason) {
				var input = {
					Title: 'Отказ от участия в группе',
					group: id,
					user: DATA.user.id,
					reason: result.reason,
				}
				m.createReasonsLog(input).then(function (sp, idLog, log) {
					if (log) {
						if (log.length) log = log[0];
						var caml = 'Text Title Eq absolute-forum And Lookup communities Eq ' + group.community.get_lookupId();
						var defAbsolute = $.Deferred();
						m.getUsersAccessSection({ caml: caml }).then(function (users) {
							var absoluteUsers = {};
							if (users) {
								for (var index = 0; index < users.length; index++) {
									var user = users[index];
									var userId = user.user.get_lookupId();
									absoluteUsers[userId] = {
										id: userId,
										name: user.user.get_lookupValue(),
									};
								}
							}
							//if (!Object.keys(absoluteUsers).length) {
							m.getUsersADByUid(MAILS_ADMINS_GROUP).then(function (users) {
								if (users) {
									for (var index = 0; index < users.length; index++) {
										var user = users[index];
										var userId = user.uid;
										absoluteUsers[userId] = {
											id: userId,
											name: user.Title,
										}
									}
								}
								defAbsolute.resolve(absoluteUsers);
							})
							//} else {
							//	defAbsolute.resolve(absoluteUsers);
							//}
						});
						defAbsolute.then(function (absoluteUsers) {
							var groupModerator = {
								id: group.moderator.get_lookupId(),
								name: group.moderator.get_lookupValue(),
							}
							absoluteUsers[groupModerator.id] = groupModerator;
							var to = Object.keys(absoluteUsers);
							var userName = log.user.get_lookupValue();
							var theme = 'Пользователь ' + userName + ' отказался от участия в группе «' + group.Title + '».';
							var body = '\
								<p>\
									Добрый день. Пользователь <a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ log.user.get_lookupId() + '&section=activity">' + userName + '</a> отказался от участия в группе «<a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target=' + group.ID + '">' + group.Title + '</a>» в профессиональном сообществе "' + group.community.get_lookupValue() + '".\
								</p>\
								<p>\
									Причина отказа от участия:<br>\
									'+ result.reason + '\
								</p>\
							';
							new Mail(['aura'], to, theme, body, false, {
								template: true,
								send: MAILS_SEND_G,
							});
						});
					}
					m.controlUserInGroup(id, 'del').then(function (sp, id, item) {
						sendMailEditGroupUsers(false, [DATA.user.id], item).then(function () {
							TPL.restartRouter();
						});
					});
				})
			}
		}, {
			okTitle: 'Отказаться',
		});

	}
}
function deleteUserInDiscussion(discussion) {
	var id = discussion.ID;
	if (id) {
		new AuraForm([
			{
				title: 'Отказ от участия в обсуждении',
			}, {
				labeled: {
					label: 'Причина',
					uniqueName: 'reason',
				}
			},
		], function (result) {
			// console.log(result);
			if (result.reason) {
				var input = {
					Title: 'Отказ от участия в обсуждении',
					discussion: id,
					user: DATA.user.id,
					reason: result.reason,
				}
				m.createReasonsLog(input).then(function (sp, idLog, log) {
					m.getGroups({ caml: 'ID Eq ' + discussion.group.get_lookupId() }).then(function (group) {
						if (group && group.length) group = group[0];
						// console.log(group);
						if (log) {
							if (log.length) log = log[0];
							var caml = 'Text Title Eq absolute-forum And Lookup communities Eq ' + group.community.get_lookupId();
							var defAbsolute = $.Deferred();
							m.getUsersAccessSection({ caml: caml }).then(function (users) {
								var absoluteUsers = {};
								if (users) {
									for (var index = 0; index < users.length; index++) {
										var user = users[index];
										var userId = user.user.get_lookupId();
										absoluteUsers[userId] = {
											id: userId,
											name: user.user.get_lookupValue(),
										};
									}
								}
								//if (!Object.keys(absoluteUsers).length) {
								m.getUsersADByUid(MAILS_ADMINS_GROUP).then(function (users) {
									if (users) {
										for (var index = 0; index < users.length; index++) {
											var user = users[index];
											var userId = user.uid;
											absoluteUsers[userId] = {
												id: userId,
												name: user.Title,
											}
										}
									}
									defAbsolute.resolve(absoluteUsers);
								})
								//} else {
								//	defAbsolute.resolve(absoluteUsers);
								//}
							});
							defAbsolute.then(function (absoluteUsers) {
								var groupModerator = {
									id: group.moderator.get_lookupId(),
									name: group.moderator.get_lookupValue(),
								}
								var author = {
									id: discussion.Author.get_lookupId(),
									name: discussion.Author.get_lookupValue(),
								}
								absoluteUsers[groupModerator.id] = groupModerator;
								absoluteUsers[author.id] = author;
								var to = Object.keys(absoluteUsers);
								var userName = log.user.get_lookupValue();
								var theme = 'Пользователь ' + userName + ' отказался от участия в обсуждении «' + discussion.Title + '».';
								var body = '\
								<p>\
									Добрый день. Пользователь <a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ log.user.get_lookupId() + '&section=activity">' + userName + '</a> отказался от участия в обсуждении «<a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=discussions&target=' + discussion.ID + '">' + discussion.Title + '</a>» в группе «<a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target=' + group.ID + '">' + group.Title + '</a>» в профессиональном сообществе "' + group.community.get_lookupValue() + '".\
								</p>\
								<p>\
									Причина отказа от участия:<br>\
									'+ result.reason + '\
								</p>\
							';
								new Mail(['aura'], to, theme, body, false, {
									template: true,
									send: MAILS_SEND_G,
								});
							});
						}
						m.controlUserInDiscussion(id, 'del').then(function (sp, id, item) {
							// console.log(item);

							sendMailEditDiscussionUsers(false, [DATA.user.id], item).then(function () {
								TPL.restartRouter();
							});
						});
					})
				});
			}
		}, {
			okTitle: 'Отказаться',
		});

	}
}
function rejectDiscussion(id) {
	var def = $.Deferred();
	if (id) {
		// console.log(id);
		new AuraForm([
			{
				title: 'Удаление обсуждения',
			}, {
				text: {
					label: 'Причина удаления',
					uniqueName: 'reason',
					value: '',
					editor: false,
				}
			},
		], function (result) {
			// console.log(result);
			if (result.reason) {
				var input = {
					Title: 'Удаление обсуждения',
					discussion: id,
					user: DATA.user.id,
					reason: result.reason,
				}
				m.createReasonsLog(input).then(function () {
					m.updateDiscussions({ ID: id, active: 0 }).then(function (sp, idDis, item) {
						// console.log(sp, idDis, item);
						if (item) {
							if (item.length) item = item[0];
							m.getGroups({ caml: 'ID Eq ' + item.group.get_lookupId() }).then(function (group) {
								if (group) {
									if (group.length) group = group[0];
									var groupUsersIds = [];
									if (group.users) {
										for (var index = 0; index < group.users.length; index++) {
											var groupUserId = group.users[index].get_lookupId();
											groupUsersIds.push(groupUserId);
										}
									}
									var to = groupUsersIds;
									var theme = 'Обсуждение «' + item.Title + '» удалено.';
									var body = '\
										<p>\
											Добрый день. Обсуждение «' + item.Title + '» в группе «' + group.Title + '» в профессиональном форуме «' + group.community.get_lookupValue() + '» удалено.\
										</p>\
										<p>\
											Причина удаления:<br>\
											'+ result.reason + '\
										</p>\
										<p>\
											Чтобы посмотреть другие обсуждения в группе, перейдите <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target='+ group.ID + '"> по этой ссылке</a>\
										</p>\
									';
									new Mail(['aura'], to, theme, body, false, {
										template: true,
										send: MAILS_SEND_G,
									});
									def.resolve();
								} else {
									def.resolve();
								}
							});
						} else {
							def.resolve();
						}
					});
				});
			}
		}, {
			okTitle: 'Отклонить',
			cancelTitle: 'Отмена',
		});
	} else {
		def.reject();
	}
	return def;
}
function approveGroup(id) {
	var def = $.Deferred();
	new AuraForm([
		{
			title: 'Утверждение группы',
		}, {
			html: 'Вы уверены, что хотите утвердить группу?',
		}
	], function () {
		var defMail = $.Deferred();
		m.updateGroups({ ID: id, active: 1, status: 'approved' }).then(function (sp, id, item) {
			if (item) item = item[0];
			var communityName = item.community.get_lookupValue();
			var to = item.Author.get_lookupId();
			var theme = 'Созданная вами группа утверждена';
			var body = '\
				<p>\
					Добрый день. Созданная вами группа "' + item.Title + '" утверждена модератором форума "' + communityName + '".\
				</p>\
				<p>\
					Теперь вы можете создавать обсуждения и приглашать участников в свою группу. <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target='+ item.ID + '">Ссылка на группу</a>.\
				</p>\
				<p>\
					Благодарим за участие в развитии профессиональных сообществ.\
				</p>\
			';
			new Mail(['aura'], to, theme, body, false, {
				template: true,
				send: MAILS_SEND_G,
			});
			if (id && item.community) {
				var options = {
					caml: 'Lookup community Eq ' + item.community.get_lookupId() + ' And (Text status Neq reject And Boolean active Eq 1)',
					debugMode: true,
				}
				// console.log(options);
				m.getGroups(options).then(function (itemsGroups) {
					// console.log(itemsGroups, item);
					var toGroup = [];
					var to2 = [];
					if (itemsGroups) {
						for (var index = 0; index < itemsGroups.length; index++) {
							var itemGroup = itemsGroups[index];
							if (itemGroup.users && (itemGroup.ID == item.ID)) {
								for (var key = 0; key < itemGroup.users.length; key++) {
									var userGroup = itemGroup.users[key].get_lookupId();
									if (userGroup && !~to2.indexOf(userGroup)) {
										to2.push(userGroup);
									}
								}
							}
						}
						for (var index = 0; index < itemsGroups.length; index++) {
							var itemGroup = itemsGroups[index];
							if (itemGroup.ID != item.ID) {
								if (itemGroup.moderator) {
									var moderatorGroup = itemGroup.moderator.get_lookupId();
									if (!~toGroup.indexOf(moderatorGroup) && !~to2.indexOf(userGroup)) {
										toGroup.push(moderatorGroup);
									}
								}
								if (itemGroup.users) {
									for (var key = 0; key < itemGroup.users.length; key++) {
										var userGroup = itemGroup.users[key].get_lookupId();
										if (userGroup && !~toGroup.indexOf(userGroup) && !~to2.indexOf(userGroup)) {
											toGroup.push(userGroup);
										}
									}
								}
							}
						}
					}
					themeGroup = 'В профессиональном форуме «' + communityName + '» появилась новая группа';
					bodyGroup = '\
						<p>\
							Добрый день. В профессиональном форуме «' + communityName + '» появилась новая группа «' + item.Title + '».\
						</p>\
						<p>\
							Чтобы ознакомиться с тематикой группы и стать ее участником, перейдите по <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target='+ item.ID + '">этой ссылке</a>.\
						</p>\
					';
					themeGroup2 = 'Вы стали участником в группе «' + item.Title + '».';
					bodyGroup2 = '\
						<p>\
							Добрый день. Вы стали участником в новой группе  «' + item.Title + '» %» в профессиональном форуме «' + communityName + '».\
						</p>\
						<p>\
							Вы были предложены в качестве участника инициатором создания группы <a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ item.Author.get_lookupId() + '&section=activity">' + item.Author.get_lookupValue() + '</a>\
						</p>\
						<p>\
							Теперь вы можете создавать обсуждения в группе и писать комментарии в уже существующих обсуждениях.\
						</p>\
						<p>\
							Чтобы начать активность в группе или отказаться от участия, перейдите по <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target='+ item.ID + '">этой ссылке</a>.\
						</p>\
						<p>\
							Благодарим за участие в развитии профессиональных сообществ в Ауре.\
						</p>\
					';
					new Mail(['aura'], toGroup, themeGroup, bodyGroup, false, {
						template: true,
						send: MAILS_SEND_G,
					});
					new Mail(['aura'], to2, themeGroup2, bodyGroup2, false, {
						template: true,
						send: MAILS_SEND_G,
					});
					defMail.resolve(item);
				})
			} else {
				defMail.resolve(item);
			}
			defMail.then(def.resolve);
		});
	}, {
		okTitle: 'Утвердить',
		cancelTitle: 'Отмена',
		submittable: true,
		confirmable: true
	});
	return def;
}
function rejectGroup(id, event) {
	var del = false;
	// console.log(event);

	if (event == 'delete') del = true;
	var def = $.Deferred();
	new AuraForm([
		{
			title: (del ? 'Удаление группы' : 'Отклонение группы'),
		}, {
			text: {
				label: (del ? 'Причина удаления' : 'Причина отклонения'),
				uniqueName: 'reason',
				value: '',
				editor: false,
			}
		},
	], function (result) {
		// console.log(result);
		if (result.reason) {
			var input = {
				Title: (del ? 'Удаление группы' : 'Отклонение группы'),
				group: id,
				user: DATA.user.id,
				reason: result.reason,
			}
			m.createReasonsLog(input).then(function (spLog, idLog, log) {
				if (log) log = log[0];
				m.updateGroups({ ID: id, active: 0, status: 'reject' }).then(function (sp, id, item) {
					if (item) item = item[0];
					var idModerator = (log.user ? log.user.get_lookupId() : DATA.user.id);
					var nameModerator = (log.user ? log.user.get_lookupValue() : log.Author.get_lookupValue());
					var to, theme, body;
					if (del) {
						to = [];
						if (item.moderator) to.push(item.moderator.get_lookupId());
						if (item.users) {
							for (var index = 0; index < item.users.length; index++) {
								var user = item.users[index];
								if (user) {
									to.push(user.get_lookupId());
								}
							}
						}
						theme = 'Группа «' + item.Title + '» удалена';
						body = '\
							<p>\
								Добрый день. Группа "' + item.Title + '" в форуме "' + (item.community ? item.community.get_lookupValue() : '') + ' удалена".\
							</p>\
							<p>\
								Причина удаления:<br>\
								'+ (log.reason ? log.reason : (result.reason ? result.reason : '')) + '\
							</p>\
							<p>\
								По всем вопросам можно обратиться к модератору \
								<a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ idModerator + '&section=activity">' + nameModerator + '</a>.\
							</p>\
						';
					} else {
						to = item.Author.get_lookupId();
						theme = 'Создание группы отклонено';
						body = '\
							<p>\
								Добрый день. Созданная вами группа "' + item.Title + '" отклонена модератором форума "' + (item.community ? item.community.get_lookupValue() : '') + '".\
							</p>\
							<p>\
								Причина отклонения:<br>\
								'+ (log.reason ? log.reason : '') + '\
							</p>\
							<p>\
								По всем вопросам можно обратиться к модератору \
								<a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ idModerator + '&section=activity">' + nameModerator + '</a>.\
							</p>\
						';
					}
					new Mail(['aura'], to, theme, body, false, {
						template: true,
						send: MAILS_SEND_G,
					});
					def.resolve(item);
				});
			})
		}
	}, {
		okTitle: 'Отклонить',
		cancelTitle: 'Отмена',
	});
	return def;
}
function sendModeratorMails(before, after, item) {
	var def = $.Deferred();
	var defAbsolute = $.Deferred();
	if (after && before) {
		var beforeModer = {
			id: before.get_lookupId(),
			name: before.get_lookupValue(),
		}
		var afterModer = {
			id: after.get_lookupId(),
			name: after.get_lookupValue(),
		}
		if (beforeModer.id != afterModer.id) {
			var communityName = item.community.get_lookupValue();
			if (item.users) {
				var usersGroupTo = [];
				for (var index = 0; index < item.users.length; index++) {
					var userGroupId = item.users[index].get_lookupId();
					if (!~[beforeModer.id, afterModer.id].indexOf(userGroupId)) {
						usersGroupTo.push(userGroupId);
					}
				}
				var groupTheme = 'В группе «' + item.Title + '» сменился модератор.';
				var groupBody = '\
					<p>\
						Добрый день. В группе «' + item.Title + '» в профессиональном форуме «' + communityName + '» сменился модератор.\
					</p>\
					<p>\
						Новый модератор: <a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ afterModer.id + '&section=activity">' + afterModer.name + '</a>.\
					</p>\
					<p>\
						<a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target=' + item.ID + '">Ссылка на группу</a>.\
					</p >\
				';
				new Mail(['aura'], usersGroupTo, groupTheme, groupBody, false, {
					template: true,
					send: MAILS_SEND_G,
				});
			}
			var caml = 'Text Title Eq absolute-forum And Lookup communities Eq ' + item.community.get_lookupId();
			m.getUsersAccessSection({ caml: caml }).then(function (users) {
				var absoluteUsers = {};
				if (users) {
					for (var index = 0; index < users.length; index++) {
						var user = users[index];
						var userId = user.user.get_lookupId();
						absoluteUsers[userId] = {
							id: userId,
							name: user.user.get_lookupValue(),
						};
					}
				}
				if (!Object.keys(absoluteUsers).length) {
					m.getUsersADByUid(MAILS_ADMINS_GROUP).then(function (users) {
						if (users) {
							for (var index = 0; index < users.length; index++) {
								var user = users[index];
								var userId = user.uid;
								absoluteUsers[userId] = {
									id: userId,
									name: user.Title,
								}
							}
						}
						defAbsolute.resolve(absoluteUsers);
					})
				} else {
					defAbsolute.resolve(absoluteUsers);
				}
			});
			defAbsolute.then(function (absoluteUsers) {
				var absoluteText = '';
				if (Object.keys(absoluteUsers).length) {
					absoluteText += '<ul>';
					for (var key in absoluteUsers) {
						if (absoluteUsers.hasOwnProperty(key)) {
							var element = absoluteUsers[key];
							absoluteText += '<li>\
								<a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ key + '&section=activity">\
									'+ element.name + '\
								</a>\
							</li>';
						}
					}
					absoluteText += '</ul>';
				}
				var beforeTo = beforeModer.id;
				var afterTo = afterModer.id;
				var beforeTheme = 'Вы сняты с роли модератора в группе «' + item.Title + '».';
				var beforeBody = '\
					<p>\
						Добрый день. Вы сняты с роли модератора в группе «' + item.Title + '» в профессиональном форуме «' + communityName + '». <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target=' + item.ID + '">Ссылка на группу</a>.\
					</p>\
					<p>\
						По всем вопросам можно обратиться к модераторам профессионального форума:<br>\
						'+ absoluteText + '\
					</p >\
				';
				var afterTheme = 'Вы назначены модератором в группе «' + item.Title + '».';
				var afterBody = '\
					<p>\
						Добрый день. Вы назначены модератором в группе «' + item.Title + '» в профессиональном форуме «' + communityName + '». <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target=' + item.ID + '">Ссылка на группу</a>.\
					</p>\
					<p>\
						Благодарим за участие в развитии профессиональных сообществ.\
					</p>\
				';
				new Mail(['aura'], beforeTo, beforeTheme, beforeBody, false, {
					template: true,
					send: MAILS_SEND_G,
				});
				new Mail(['aura'], afterTo, afterTheme, afterBody, false, {
					template: true,
					send: MAILS_SEND_G,
				});
			})
		} else {
			def.resolve(item);
		}
	} else {
		def.resolve(item);
	}
	return def;
}
function sendMailEditGroupUsers(add, del, item) {
	// console.log(item, add, del);
	var def = $.Deferred();
	var defAdd = $.Deferred();
	var defDel = $.Deferred();
	if (item && item.length) item = item[0];
	if (item && item.active) {
		var communityName = item.community.get_lookupValue();
		if (add.length) {
			var addTo = add;
			var addTheme = 'Вы стали участником в группе «' + item.Title + '».';
			var addBody = '\
				<p>\
					Добрый день. Вы стали участником в группе «' + item.Title + '» в профессиональном форуме "' + communityName + '".\
				</p>\
				<p>\
					Теперь вы можете создавать обсуждения в группе и писать комментарии в уже существующих обсуждениях.\
				</p>\
				<p>\
					Чтобы начать активность в группе или отказаться от участия, перейдите <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=groups&target='+ item.ID + '">по ссылке на группу</a>..\
				</p>\
				<p>\
					Благодарим за участие в развитии профессиональных сообществ в Ауре.\
				</p>\
			';
			new Mail(['aura'], addTo, addTheme, addBody, false, {
				template: true,
				send: MAILS_SEND_G,
			});
			m.getUsersADByUid(add).then(function (usersAd) {
				var userAddAdText = '';
				if (usersAd) {
					userAddAdText += '<p>';
					if (usersAd.length > 1) {
						userAddAdText += 'Присоединились пользователи ';
					} else {
						userAddAdText += 'Присоединился пользователь ';
					}
					for (var index = 0; index < usersAd.length; index++) {
						var userAd = usersAd[index];
						// console.log(userAd);
						userAddAdText += '<a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user=' + userAd.uid + '&section=activity">' + userAd.Title + '</a> ';
					}
					userAddAdText += '</p>';
				}
				// console.log(groupTo);
				// if (item.users) {
				// 	var ids = [];
				// 	for (var index = 0; index < item.users.length; index++) {
				// 		var userId = item.users[index].get_lookupId();
				// 		if (!~add.indexOf(userId)) {
				// 			ids.push(userId);
				// 		}
				// 	}
				// 	var groupTo = ids;
				// 	var groupTheme = 'К группе «' + item.Title + '» присоединился новый участник.';
				// 	var groupBody = '\
				// 		<p>\
				// 			Добрый день. К группе «' + item.Title + '» в профессиональном форуме "' + communityName + '".\
				// 		</p>\
				// 		'+ userAddAdText + '\
				// 	';
				// 	if (usersAd.length > 1) {
				// 		groupTheme = 'К группе «' + item.Title + '» присоединились новые участники.';
				// 	}
				// 	new Mail(['aura'], groupTo, groupTheme, groupBody, false, {
				// 		template: true,
				// 		send: MAILS_SEND_G,
				// 	});
				// }
				defAdd.resolve();
			});
		} else {
			defAdd.resolve();
		}
		if (del.length) {
			var moderatorText = '';
			if (item.moderator) {
				var idModerator = item.moderator.get_lookupId();
				var nameModerator = item.moderator.get_lookupValue();
				moderatorText += '\
					<p>\
						По всем вопросам можно обратиться к модератору группы \
						<a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ idModerator + '&section=activity">' + nameModerator + '</a>.\
					</p>\
				';
			}
			var delTo = del;
			var delTheme = 'Вы сняты с роли участника в группе «' + item.Title + '».';
			var delBody = '\
				<p>\
					Добрый день. Вы сняты с роли участника в группе  «' + item.Title + '» в профессиональном форуме "' + communityName + '".\
				</p>\
				'+ moderatorText + '\
			';
			new Mail(['aura'], delTo, delTheme, delBody, false, {
				template: true,
				send: MAILS_SEND_G,
			});
			defDel.resolve();
		} else {
			defDel.resolve();
		}
		$.when(defDel, defAdd).then(def.resolve);
	} else {
		def.resolve(item)
	}
	return def;
}
function sendMailEditDiscussionUsers(add, del, item) {
	// console.log(item, add, del);
	var def = $.Deferred();
	var defAdd = $.Deferred();
	var defDel = $.Deferred();
	if (item && item.length) item = item[0];
	if (item && item.active) {
		var communityName = item.group.get_lookupValue();
		if (add.length) {
			var addTo = add;
			var addTheme = 'Вы стали участником скрытого обсуждения «' + item.Title + '».';
			var addBody = '\
				<p>\
					Добрый день.Вы стали участником скрытого обсуждения «' + item.Title + '» в группе «' + communityName + '».\
				</p>\
				<p>\
					Чтобы принять участие в обсуждении, перейдите <a href="http://aura.dme.aero.corp/app-pages/forums/type.aspx?section=discussions&target='+ item.ID + '"> по этой ссылке</a>\
				</p>\
				<p>\
					Благодарим за развитие профессиональных сообществ в Ауре.\
				</p>\
			';
			new Mail(['aura'], addTo, addTheme, addBody, false, {
				template: true,
				send: MAILS_SEND_G,
			});
		} else {
			defAdd.resolve();
		}
		if (del.length) {
			var moderatorText = '';
			// if (item.moderator) {
			// var idModerator = item.moderator.get_lookupId();
			// var nameModerator = item.moderator.get_lookupValue();
			moderatorText += '\
				<p>\
					По всем вопросам можно обратиться к создателю обсуждения \
					<a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user='+ item.Author.get_lookupId() + '&section=activity">' + item.Author.get_lookupValue() + '</a>.\
				</p>\
			';
			// }
			var delTo = del;
			var delTheme = 'Вы сняты с роли участника обсуждения «' + item.Title + '».';
			var delBody = '\
				<p>\
					Добрый день. Вы сняты с роли участника обсуждения  «' + item.Title + '» в группе "' + communityName + '".\
				</p>\
				'+ moderatorText + '\
			';
			new Mail(['aura'], delTo, delTheme, delBody, false, {
				template: true,
				send: MAILS_SEND_G,
			});
			defDel.resolve();
		} else {
			defDel.resolve();
		}
		$.when(defDel, defAdd).then(def.resolve);
	} else {
		def.resolve(item)
	}
	return def;
}
function diff(from, to) {
	var result = {
		delete: [],
		add: [],
	}
	for (var index = 0; index < from.length; index++) {
		var element = from[index];
		if (!~to.indexOf(element)) {
			// console.log('Удалить ' + element);
			result.delete.push(element);
		}
	}
	for (var index = 0; index < to.length; index++) {
		var element = to[index];
		if (!~from.indexOf(element)) {
			// console.log('Добавить ' + element);
			result.add.push(element);
		}
	}
	return result;
}
//  ===========================================================================
//  ===========       =====    ====  ====  ==        ==        ==       =======
//  ===========  ====  ===  ==  ===  ====  =====  =====  ========  ====  ======
//  ===========  ====  ==  ====  ==  ====  =====  =====  ========  ====  ======
//  ===========  ===   ==  ====  ==  ====  =====  =====  ========  ===   ======
//  ===========      ====  ====  ==  ====  =====  =====      ====      ========
//  ===========  ====  ==  ====  ==  ====  =====  =====  ========  ====  ======
//  ===========  ====  ==  ====  ==  ====  =====  =====  ========  ====  ======
//  ===========  ====  ===  ==  ===   ==   =====  =====  ========  ====  ======
//  ===========  ====  ====    =====      ======  =====        ==  ====  ======
//  ===========================================================================

function routeByUrl(element) {
	// var saveGet = +element.getAttribute('data-save-get');
	// var customUrl;
	// try {
	// 	customUrl = JSON.parse(element.getAttribute('data-url-params'));
	// } catch (err) {
	// 	console.warn(err);
	// }

	// if (!saveGet) uriG.clearQuery();
	// if (customUrl) {
	// 	for (var key in customUrl) {
	// 		uriG.setQueryKey(key, customUrl[key]);
	// 	}
	// 	historyUrlG = location.search;
	// 	TPL.restartRouter('type.aspx?' + uriG.queryString);
	// } else {
	// 	// historyUrlG = location.search;
	// 	// console.log(element.href);

	TPL.restartRouter(element.href);
	// }
}

//  ==============================================================================
//  ===========        ==  ====  ==        ==  =======  ==        ===      =======
//  ===========  ========  ====  ==  ========   ======  =====  =====  ====  ======
//  ===========  ========  ====  ==  ========    =====  =====  =====  ====  ======
//  ===========  ========  ====  ==  ========  ==  ===  =====  ======  ===========
//  ===========      ====   ==   ==      ====  ===  ==  =====  ========  =========
//  ===========  =========  ==  ===  ========  ====  =  =====  ==========  =======
//  ===========  =========  ==  ===  ========  =====    =====  =====  ====  ======
//  ===========  ==========    ====  ========  ======   =====  =====  ====  ======
//  ===========        =====  =====        ==  =======  =====  ======      =======
//  ==============================================================================

$document.on('click', '.item_url', function (e) {
	e.preventDefault();
	routeByUrl(e.currentTarget);
	return false;
});

var uriG = new AuraURI;

var searcherG;
var userAccessG;
var userGroupsG;
var MAILS_SEND_G;
var MAILS_ADMINS_GROUP;
var camlFilterG;

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
                case 'expert-map':
					viewCommander = 'showExpertMap';
                    break;
                // в данном примере демонстрируется только showExpertMap
				// default:
				// 	viewCommander = 'showMain';
				// 	break;
			}
			TPL.clearAll();
			var page = v[viewCommander];
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
    /**
	 * function for getting and combining global user rights and local for current user
	 * @param {*Number} userId 
	 * @return Promise {access - boolean, userGroups - object) userGroups {}
	 */
	getUserAccess: function (userId) {
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
    getUsersADByUid: function (usersIds, options) {
		var def = $.Deferred();
		var inputs = usersIds;
		inputs ? QUERY.getUsersADByUid(inputs, def.resolve, options) : def.resolve();
		return def;
    },
    getAnswers: function (options) {
		var def = $.Deferred();
		QUERY.getListItems(LIBRARY_G.Answers, def.resolve, options);
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
    showExpertMap: {
		render: function () {
			var it = this;
			TPL.set({ main: 2 });
			var tplsData = {};
			it.renderContent(tplsData);
			v.renderExpertsMap(tplsData);
		},
		renderContent: function (tplsData) {
			var options = {};
			options.note = {
				left: [],
				right: [],
			}
			options.note.left.push({
				name: 'Карта экспертизы',
				header: true,
			});
			TPL.addBlockMain('maps', function (block, content) {
				tplsData.maps = {
					name: 'maps',
					block: block,
					content: content,
				};
				content.append('\
					<div class="js-search-output-container experts-map"></div>\
				');
			}, options);
		},
		renderWidgetFilterBlock: function (tplsData) {
			var option = {};
			// option.heading = {
			// 	name: 'Фильтр',
			// }
			TPL.addBlockWidget('filter', function (block, content) {
				tplsData.filter = {
					name: 'filter',
					block: block,
					content: content,
				};
			}, option);
		},
		renderWidgetSortBlock: function (tplsData) {
			var option = {};
			option.heading = {
				name: 'Сортировка',
			}
			TPL.addBlockWidget('sorting', function (block, content) {
				tplsData.sorting = {
					name: 'sorting',
					block: block,
					content: content,
				};
			}, option);
		},
		renderWidgetTags: function (tplsData) {
			var option = {};
			option.heading = {
				name: 'Теги',
			}
			TPL.addBlockWidget('tags', function (block, content) {
				tplsData.tags = {
					name: 'tags',
					block: block,
					content: content,
				};
			}, option);
		}
    },
    renderExpertsMap: function (tplsData) {
		var camlObject = {}
		if (uriG.query.search) {
			if (!camlObject.hasOwnProperty('Title')) {
				camlObject['Title'] = [];
			}
			camlObject['Title'].push({
				field: "Title",
				logic: "Or",
				type: "Text",
				command: 'Contains',
				value: uriG.query.search
			});
        }
		if (!camlObject.hasOwnProperty('isActive')) {
			camlObject['isActive'] = [];
		}
		camlObject['isActive'].push({
			field: "isActive",
			logic: "And",
			type: "Boolean",
			command: 'Eq',
			value: 1
		});

		var caml = getCamlOfObject(camlObject);
		var viewFields = ['ID', 'uid', 'isActive', 'expertRating', 'ShortPath', 'Avatar', 'PersonID', 'AvatarPos', 'FullPath', 'Title', 'PhoneInt', 'Position', 'Knowledges'];
		var orderBy = 'expertRating';
		var ascending = false;
		var columns = ['Title', 'Position', 'Knowledges'];

		searcherG && searcherG.destroy();
		searcherG = new Searcher('/AM/UsersAD', {
            preRender: function (items, def) {
                m.getAnswers({
                    orderBy: 'rating:DESC',
                    caml: 'Boolean active Eq 1 And Lookup question Eq ' + ids,
                }).then(def.resolve);
            },
			render: function (item, container) {
				v.renderExpert(item, container);
			},
			columns: columns,
			inputContainer: '.consalting-search',
			outputContainer: '.experts-map',
			searchKey: 'search',
			orderBy: orderBy,
			ascending: ascending,
			limit: 5,
			viewFields: viewFields,
			pageSize: 24,
			caml: caml,
			orderByDate: true,
			// debugMode: true,
		});
    },
    renderExpert: function (item, container) {
		var html = '\
            <div class="experts" data-uid="'+ item.uid + '" >\
                <div class="load-user" data-uid="'+ item.uid + '">\
                    <a \
                        href="/app-pages/expert-consulting/type.aspx?section=personal&user='+ item.uid + '"\
                        class="route_url"\
                    >\
                        '+ item.name + '\
                    </a>\
                </div>\
                <div class="experts-action">\
                    <div class="send-question__btn send-question__'+ item.uid + ' a-form__button a-form__button_color-1" data-uid="' + item.uid + '">Задать вопрос</div>\
                </div>\
            </div>\
		';
		container.append(html);
		$('.send-question__' + item.uid).click(function () {
			v.questionsForm().then(function (sp, id, newQuestion) {
				if (newQuestion && userAccessG.hasOwnProperty('userAD')) {
					sendUserQuestion(item.uid, userAccessG.userAD, newQuestion[0]);
				}
			});
		});
	},
    questionsForm: function (item) {
		var def = $.Deferred();
		var defCat = $.Deferred();
		m.getCategories({ viewFields: ['ID', 'Title'] }).then(defCat.resolve);
        
        var categoriesActive = [];
        if (item && item.categories) {
			for (var key = 0; key < item.categories.length; key++) {
				categoriesActive.push(item.categories[key].get_lookupId());
			}
        }
        
		defCat.then(function (categories) {
			var formInputs = [
				{
					title: (item ? 'Редактировать' : 'Задать новый') + ' вопрос',
				}, {
					labeled: {
						label: 'Заголовок',
						uniqueName: 'title',
						value: (item && item.Title ? item.Title : ''),
					}
				}, {
					text: {
						label: 'Описание',
						uniqueName: 'description',
						value: (item && item.description ? item.description : ''),
					}
				}, {
					dropList: {
						label: 'Категории',
						uniqueName: 'categories',
						multiSelect: true,
						active: (categoriesActive ? categoriesActive : ''),
						values: {
							source: categories,
						},
					}
				}, {
					tags: {
						uniqueName: 'tags',
						label: 'Теги',
						listData: LIBRARY_G.Questions,
						active: (item && item.tags ? item.tags : ''),
						required: true,
					}
				}, {
					imgUpload: {
						label: 'Фон',
						listData: LIBRARY_G.Icons,
						required: false,
						uniqueName: 'icon',
						urlColumnName: 'url',
						value: (item ? getImageName(item['icon_x003a_url']) : ''),
					}
				},
			]
			new AuraForm(formInputs, function (results) {
				var categoriesIds = [];
				if (results.categories) {
					for (var index = 0; index < results.categories.length; index++) {
						var project = results.categories[index];
						categoriesIds.push(project.id);
					}
				}
				var imgId;
				if (results.icon) {
					if (results.icon.selected) imgId = results.icon.selected.id;
					if (results.icon.uploaded) imgId = results.icon.uploaded.ID;
				}
				var inputs = {
					Title: results.title,
					description: results.description,
					icon: imgId,
					user: userAccessG.userAD.ID,
					tags: results.tags.tagIds,
					categories: categoriesIds,
				}
				if (item) {
					// update
					inputs.ID = item.ID;
					m.updateQuestions(inputs).then(def.resolve);
				} else {
					// create
					m.createQuestions(inputs).then(def.resolve);
				}
			}, {
				okTitle: (item ? 'Сохранить' : 'Создать'),
			});
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

/**
 * Converts an object to a caml request for SPX
 * @param {Object} camlObject - { *nameField: [{ value: value, type: "Lookup/Text/Boolean/...", command: 'Eq/Inserts/Neq/...' }, ...]
 */
function getCamlOfObject(camlObject) {
	// console.log(camlObject);
	var count = 0;
	var caml = '';
	for (var key in camlObject) {
		if (camlObject.hasOwnProperty(key)) {
			count++;
			var value = (camlObject[key].value ? camlObject[key].value : '');
			var valueArr = [];
			var type = camlObject[key].type;
			var command = (camlObject[key].command ? camlObject[key].command : false);
			var field = (camlObject[key].field ? camlObject[key].field : false);
			var logic = (camlObject[key].logic ? camlObject[key].logic : 'And');
			var option = (camlObject[key].option ? camlObject[key].option : false);
			if (camlObject[key].length) {
				for (var index = 0; index < camlObject[key].length; index++) {
					var element = camlObject[key][index];
					type = element.type;
					command = (element.command ? element.command : false);
					field = (element.field ? element.field : false);
					logic = (element.logic ? element.logic : 'And');
					value = (index === camlObject[key].length - 1 ? value + element.value : value + element.value + ',');
					option = (element.option ? element.option : false);
					valueArr.push(element.value);
				}
			}
			var str = type + ' ' + (field ? field : key) + ' ' + (command ? command : type == 'Lookup' ? 'Includes' : 'Eq') + ' ' + (valueArr.length ? valueArr : value) + (option ? ' ' + option : '');
			if (count >= 3) {
				caml = '(' + caml + ') ' + logic + ' ' + str;
			} else if (caml) {
				caml = caml + ' ' + logic + ' ' + str;
			} else {
				caml = str;
			}
		}
	}
	return caml;
};
/**
 * Returns the current full path by removing keys from the parameter deletedQuery
 * @param {*Array} deletedQuery delete key in url
 * @returns {*String}
 */
function getFullPath(deletedQuery) {
	var result = uriG.absolutePath;
	if (deletedQuery) {
		if (!deletedQuery.length) deletedQuery = [deletedQuery];
	}
	if (uriG.query) {
		var count = 0;
		for (var key in uriG.query) {
			if (uriG.query.hasOwnProperty(key)) {
				var element = uriG.query[key];
				// console.log(element, key);
				if (!~deletedQuery.indexOf(key)) {
					result += (count ? '&' : '?') + key + '=' + element;
				}
				count++;
			}
		}
	}
	return result;
}
/**
 * Notifies the user of a new question by mail
 * @param {*Number} uid 
 * @param {*Number} userAD 
 * @param {*String} newQuestion 
 */
function sendUserQuestion(uid, userAD, newQuestion) {
	var to = uid;
	var theme = 'Пользователь задал Вам вопрос в экспертном консалтинге';
	var body = '<h3>Пользователь <a href="http://aura.dme.aero.corp/app-pages/profile/type.aspx?user=' + userAD.uid + '&section=activity">' + getFirstLastName(userAD.Title) + '</a> запросил консалтинг</h3>\
				<p>Заголовок:</p>\
				<p>'+ (newQuestion.Title ? newQuestion.Title : 'Ошибка. Отсутствует значение') + '</p>\
				<p>Текст запроса:</p>\
				<p>'+ (newQuestion.description ? newQuestion.description : 'Ошибка. Отсутствует значение') + '</p>\
				<p><a href="'+ DATA.environment.path + '?section=question&target=' + newQuestion.ID + '">Ответить</p>\
			';
	new Mail(['aura'], to, theme, body, false, {
		template: true,
		send: MAILS_SEND_G,
	});
	new AuraForm([
		{
			title: 'Запрос консалтинга',
		}, {
			html: 'Запрос консалтинга зарегестрирован, эксперту был послано уведомление.',
		}
	], function () {
		TPL.restartRouter(DATA.environment.path + '?section=question&target=' + newQuestion.ID);
	});
}

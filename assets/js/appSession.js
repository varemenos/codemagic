define(['jquery'], function(){
	var appSession = {
		panels : {
			html : {
				state : true,
				mode : $("#markupSettings").val(),
				height: 200,
				content : ""
			},
			css : {
				state : true,
				mode : $("#stylesheetSettings").val(),
				height: 200,
				content : ""
			},
			js : {
				state : true,
				height: 200,
				content : ""
			},
			console : {
				state : false,
				height: 200
			}
		},
		settings : {
			fullscreen : false,
			title : "codeMagic",
			description : "",
			author : "",
			editor : {
				theme : localStorage.getItem("appSession_settings_editor_theme") || "tomorrow_night",
				tabSize : parseInt(localStorage.getItem("appSession_settings_editor_tabSize"), 10) || 4,
				showPrintMargin : localStorage.getItem("appSession_settings_editor_showPrintMargin") || false,
				useWrapMode : localStorage.getItem("appSession_settings_editor_useWrapMode") || true,
				useWorker : true,
				fontSize : parseInt(localStorage.getItem("appSession_settings_editor_fontSize"), 10) || parseInt($("select[name=fontSize]").val(), 10),
				showInvisibles : localStorage.getItem("appSession_settings_editor_showInvisibles") || false,
				behavioursEnabled : localStorage.getItem("appSession_settings_editor_behavioursEnabled") || true
			}
		},
		authenticate : {
			endpoint : "https://accounts.google.com/o/oauth2/auth",
			response_type : "token",
			client_id : "1785061010-1osqu1jsk03f033ehv2268jjtiung7h8.apps.googleusercontent.com",
			redirect_uri : "http://codemagic.gr",
			scope : [
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/drive"
			],
			state : "?auth",
			approval_prompt : "auto"
		},
		user : {
			username : "",
			email : ""
		}
	};

	return appSession;
});
"use strict";
/**
 * Global vars
 */
var $flashPanel 	= $('#flashMsg'),
	$container		= $('.container'),
	$header			= $('header > h1'),
	$listingPanel	= $('#listing'),
	$loginPanel 	= $('#login'),
	$actionPanel 	= $('#actions').hide()
	
;
var	_anchor 		= window.location.hash,
	_descr 			= null,
	_mapMsgs 		= {
		"errorByStatus"	:	{
		    '400' 	: "Server understood the request, but request content was invalid",
		    '401' 	: "Unauthorized Access",
		    '403' 	: "Forbidden resource not accessible",
		    '500' 	: "Internal Server Error",
		    '503' 	: "Service Unavailable"
		}
	    ,'msgHeader'	: {
	    	'add'	:	'Adding a new Zik',
	    	'del'	:	'Deleting a Zik',
	    	'def'	:	'Acting : Doing something :-)',
	    	'home'	: 	'Welcome on NodeZikApp',
	    	'list'	:	'Listing zik by ',
	    	'maj'	:	'Updating a Zik'
	    	
	    }
	    ,'TokenExpiredError'		:	'Your session has expired. Please login again to continue.'
	    ,'links'	:	{
	    	'add'	:	'/ziks/add'	
	    	,'del'	:	'/ziks/delete'	
	    	,'maj'		:	'/ziks/update'
	    	,'list'	:	{
	    		'author'	:	'/ziks/by/author'
	    		,'genre'	:	'/ziks/by/genre'
	    		,'title'	:	'/ziks/by/title'
	    	}
	    	,'home'		:	'/home'
	    	,'login'	:	'/login'
	    	,'logout'	:	'/logout'
	    	
	    	
	    }
	}

;


/**
 * Launch an AJAX Request with the default settings
 */
function launchAjaxRequest(url,type, datas,cbDone,cbFail){
	// To notify the use that request in executing
	//	$flashPanel.html('<div class="flash info"><span>Workin..</span></div>');
	//setFlash('Test Notif Message','info','Notif title');
	
	var reqAjax =  $.ajax({
			headers: {
				'api-token' : sessionStorage.getItem('token')
			}
			,url  : url
			,method : type || 'GET'
			,data : datas
	});

	reqAjax.done(function (data,status) {
		$flashPanel.fadeOut('slow');
		if(cbDone)	cbDone(data);
	});
	reqAjax.fail(function (xhr, textStatus, err) {
		var errJSON = xhr.responseJSON || {'message' : xhr.responseText };
		var title 	= _mapMsgs.errorByStatus[xhr.status ] || 'Error',
			msg		= _mapMsgs.errorByStatus[errJSON.name] || errJSON.message || 'Shit happens';
		
		console.dir(errJSON);
		
		setFlash(msg, 'error',title);
		if(errJSON.name && errJSON.name === 'TokenExpiredError' ||  errJSON.name === 'JsonWebTokenError')
			return logUserOut() && displayLoginSignup();
		if(cbFail)	cbFail(errJSON);
		
	});

	return reqAjax;
}


/**
 * Send a flashh message showed on the top of the page.
 * Styled based on his status {error,info,success,warm}
 */
function setFlash(msg, status,title) {
	var flash = '<div class="'+status+'">';
	if(title)
		flash += '<h3 class="title">' + title +'</h3>';
	flash += '<p class="content">'+msg+'</p></div>';
	
	$flashPanel.html(flash).show(1500).hide(12000);

}

/**
 * Put in the adress bar the displayed part /#{login, list, logout,add,...}
 */
function setAnchor(currentAnchor,currentDescrip){
	window.location.hash = currentAnchor;
	if(currentDescrip)
		window.location.hash += '-'+currentDescrip;
	//window.history.pushState({},null, currentAnchor);
	//document.title = anchor;
	_anchor	= 	currentAnchor;
	_descr	=	currentDescrip;

	if('login' === _anchor)
		$('#area').attr('href','/signup').attr('act','signup').text(' Signup ');
	else
		$('#area').attr('href','/logout').attr('act','logout').text(' Logout ');

}




//////////////////////////////////////////////////////////
//////////FUNCTIONS to DISPLAY the CONTENT requested./////
//////////////////////////////////////////////////////////


/**
 * What to display on acting link (add,update,delete)
 */
function displayActing(url,datas){
	console.log('Acting on : ',_anchor);
	launchAjaxRequest(url, null,null
		,function (html_data) {
			switch (_anchor) {
				case 'add':
					$listingPanel.hide();
					$header.text(_mapMsgs.msgHeader.add);
					break;
				
				case 'delete' : 
					$actionPanel.addClass('warn');
					$header.text(_mapMsgs.msgHeader.del);
					break;
				
				case 'update' : 
					$header.text(_mapMsgs.msgHeader.maj);
				
				default:
					// code
			}
			
			$actionPanel.show(); // Diplay the action content on the right
			$actionPanel.html(html_data); // Fill the action div with the page required
		}
		, function(errJSON) {
		
		}
	);
};


/**
 * What to display on the homepage link.
 */
function displayHome(){
	setAnchor('home');
	displayListing(_mapMsgs.links.list.title,function (){	// GET All ziks for the homepage
		$header.text(_mapMsgs.msgHeader.home);
		$listingPanel.prepend('<h2>All ziks added</h2>');
	});
}


/**
 * What to display to list something.
 */ 
function displayListing(url,cbDone,cbFail){
	// GET a listing on the left pane
	launchAjaxRequest(url, null,null
		,function (html_data) {
			$actionPanel.hide(); // Hidden on the action panel
			$listingPanel.show(); // Diplay the listing content
			$listingPanel.html(html_data); // Fill the listing div with the page required
			if(_descr) $header.text(_mapMsgs.msgHeader.list+_descr);
			if(cbDone) cbDone();
		}
		, function(errJSON) {
			console.log(_anchor+' Login-Signup Error : '+ errJSON);	
			if(cbFail) cbFail(errJSON);
		}
	);
}


/**
 * Display the login part. 
 */
function displayLoginSignup(url,cbDone){
	url = url || '/login'  ; // Set a defaul value :: /login
	$loginPanel.show();
	launchAjaxRequest(url,null,null,
		function (html_data,status){ // If the AJAX Request is okay ( Status : 200)
			$loginPanel.html(html_data); // Fill the login div with the html
			setAnchor('login'); // Put in the adress bar the displayed part
			if(cbDone) cbDone();
		}
		,function(errJSON) {
			console.log(' Login-Signup Error : '+ errJSON);	
		}
	);
}

/////////////////////////////////////////////////
///// FUNCTIONS to HANDLE certains EVENTS////////
/////////////////////////////////////////////////
 

/**
 * Handle the submit of any form.
 */
function formHandler(e){
	e.preventDefault();
	var formData = {'url':  this.action};
	formData['method'] = this.method;	// Get the val of the input
	$("input").each(function (index,input) {
		if(input.name){
			if(input.type === 'text' || input.type === 'password' || input.type === 'checkbox' && input.checked)
				formData[input.name] = input.value;
		}
	});

	var _fnDone = null, _fnFail = null;
	
	switch (_anchor) {
		case 'add':
			_fnDone = function (msg){	setFlash(msg,'success',_mapMsgs.msgHeader.add);	};
			break;
		case 'delete' :
			_fnDone = function (msg){
				$actionPanel.removeClass('warn');
				setFlash(msg,'success',_mapMsgs.msgHeader.del);
			};
			
			break;
		case 'update' :
			_fnDone = function (msg){	setFlash(msg,'success',_mapMsgs.msgHeader.maj);	}
			break;
		case 'login' :
			_fnDone = function (token){
				console.log("Token de %s  ==> %s",formData.pseudo,token);
				$loginPanel.hide(); // Hide the login div
				if(token){
					sessionStorage.setItem('token',token); // SAve the token in the sessionStorage
					return displayHome();
				}
			}
			
			break
		default:
			console.log(_mapMsgs.msgHeader.def);
	}
	
	// Launch a request to submit the form.
	launchAjaxRequest(formData.url,formData.method,formData,
		function (data,status){ // If the AJAX Request is okay ( Status : 200)
			if(_fnDone) _fnDone(data);
			displayListing(_mapMsgs.links.list.title);	
		}, function(errJSON) {
			console.log(_anchor+' - Error : '+ errJSON);	
			if(_fnFail) _fnFail(errJSON);
		}
	);
}



/**
 * What to do for all links.
 */
function bindClickOnLinks(e){
	e.preventDefault();

	var url = e.target.getAttribute("href"),
		act  = e.target.getAttribute('act'),
		descrip = e.target.getAttribute('descr');

	// Check first if the user can make this action
	if(act && act != 'signup' && !checkIfAuthUser())
		return ;// displayLoginSignup(); 

	setAnchor(act,descrip);
	
	switch (act) {
		case 'home':
			displayHome();
			break;
		case 'login' :
			displayLoginSignup();
			break;
		case 'logout' :
			logUserOut();
			break; 
		case 'signup' :
			displayLoginSignup('/signup');
			break;
		case 'list' :
			displayListing(url);
			break;
		default: // For the rest, (add,update,delete)
			displayActing(url);
			
	}

}



/**
 * No token --> no visit
 */
function checkIfAuthUser(){
	return (sessionStorage && sessionStorage.getItem('token'));
}

/**
 * What to do on logout.
 */
function logUserOut(){
	sessionStorage.removeItem('token');
	window.location.href = '/'; // Redirect to the homePage
}



// mainGame
$(function() {
	
	//$("a").on("click", bindClickOnLinks);
	
	// All click on an link is handled by this fct
	$container.delegate("a", "click", bindClickOnLinks);

	// All form submitted is handled by this fct
	$container.delegate("form", "submit", formHandler);

	// No token --> no visit
	if(!checkIfAuthUser())
		return displayLoginSignup();

	displayHome();

	


});
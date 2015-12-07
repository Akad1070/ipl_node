var $listingPanel = $('#listing'),
	$loginPanel = $('#login'),
	$actionPanel = $('actions')	
;


/**
 * Launch an AJAX Request with the def settings
 */
function launchAjaxRequest(_url,_method, _data,cbDone,cbFail){
	// To notify the use that requeest in executing
	$('body').prepend('<div class="flash info"><span>Workin..</span></div>');

	var reqAjax =  $.ajax({
			headers: {
				'api-token' : sessionStorage.getItem('token')
			}
			,url  : _url
			,method : _method || 'GET'
			,data : _data
	});


	if(cbDone)
		reqAjax.done(function (data,status) {
			setFlash('', 'success');
			cbDone(data);
		});
	if(cbFail)
		reqAjax.fail(function (xhr, textStatus, err) {
			setFlash(xhr.responseText, 'error');
			cbFail(xhr.responseText);
		});

	return reqAjax;
}


/**
 * Send a flashh message showed on the top of the page.
 * Styled based on his status {error,info,success,warm}
 */
function setFlash(msg, status) {
	$('.flash').remove();
	$('body').prepend('<div class="flash '+status+'"><span>' + msg + '</span></div>');
}

function displayLoginSignup(url,_cbDone){
	url = (!url) ? '/login' : url ; // Set a defaul value :: /login
	$loginPanel.removeClass('hidden');
	launchAjaxRequest(url,null,null,
		function (html_data,status){ // If the AJAX Request is okay ( Status : 200)
			$loginPanel.html(html_data);
			if(_cbDone) _cbDone();
		}
		,function (data){
			if(data.responseText === 'TokenExpiredError'){
				setFlash('Your session has expires. Please login again to continue', 'error');
			}
	});
}



function logMeOut(){
	sessionStorage.removeItem('token');
	window.location.href = '/'; // Redirect to the homePage
};


function listing(_url,_cbDone,_cbFail){
	// GET All ziks for the homepage
	launchAjaxRequest(_url, null,null
		,function (html_data) {
			$listingPanel.removeClass('hidden'); // Diplay the listing content
			$listingPanel.html(html_data); // Fill the listing div with the page required
			if(_cbDone) _cbDone();
		}
		, function(data) {
			console.log('Error Index : '+ data);	
			if(_cbFail) _cbFail(data);
		}
	);
}


function acting (_url,_datas){
	
	
};


$(function() {

	// No token --> no visit
	if(!sessionStorage.getItem('token')){
	 	displayLoginSignup(null,function (){
	 		// if click on the submit btn, call this fct
			$('#send').click(function (e){
				e.preventDefault();
				if(sessionStorage){ // If the sessionStore exists
					var pseudo =  $('#pseudo').val() ,passwd = $('#passwd').val();
					launchAjaxRequest('/login','POST',{'pseudo' :pseudo ,'passwd' : passwd},
						function (data,status){ // If the AJAX Request is okay ( Status : 200)
							console.log("Token de %s  ==> %s",pseudo,data);
							sessionStorage.setItem('token',data); // SAve the token in the sessionStorage
							$loginPanel.addClass('hidden'); // Hide the login div
							listing('/ziks/by/title',function (){	// GET All ziks for the homepage
								$listingPanel.prepend('<h2>All ziks added</h2>');
							});
						}
						,function (data){
							if(data.responseText === 'TokenExpiredError'){
								setFlash('Your session has expires. Please login again to continue', 'error');
							}
					});
				}else{
					console.log("The session Storage is not supported ! Please active JavaScript to use it");
				}
			});
	 	});
	}else{
		$('#area').attr('href','/logout').text(' Logout');
	}
	
	
	$('form').submit(function (e){
		e.preventDefault();
		console.log(" Hey form submiting ... ")	;
	});
	

	// Click on the nav link on top
	$('a').click(function(e) {
		e.preventDefault();
		var url = e.target.getAttribute("href");
		if('/' === url){
			window.location.replace('/');
			return;
		}
		if(url === '/logout')
			return logMeOut();

		console.log('Click on some link : %s',url);
		launchAjaxRequest(url,null,null
			,function(datas,status) {
				if(url === '/signup'){
					displayLoginSignup('/signup',function() {
					    // Exec this cb if the signup is diplayed
					    console.log("Sign me Up NOW !!");
	
					});
				}else{
					listing(url);
				}
			},function(err) {
				if(err.responseText === 'TokenExpiredError'){
					setFlash('Your session has expires. Please login again to continue', 'error');
					//window.location.href = '/login';
				}
			}
		);
	});
	
	

});
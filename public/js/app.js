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
		reqAjax.done(function (data) {
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





$(function() {

	// Click on the nav link on top
	$('nav a').click(function(e) {
		e.preventDefault();
		var url = e.target.getAttribute("href");
		launchAjaxRequest(url,null,null
			,function(datas) {
				if(url === '/logout'){
					sessionStorage.removeItem('token');
		    		window.location.href = '/'; // Redirect to the homePage
				}else{
					$('.container').html($(datas));
					$('a .list').click(function (e){
						e.preventDefault();
						var url = $(this).attr('href');
						launchAjaxRequest(url, null,null
							,function (data) {
								$('#listing').html($(data));
							}
							, function(data) {	console.log('Error Index : '+data);	}
						);
					});
				}
			},function(err) {
				if(err.responseText === 'TokenExpiredError'){
					setFlash('Your session has expires. Please login again to continue', 'error');
					//window.location.href = '/login';
				}
			}
		);
	});







	switch (location.pathname) {
		case '/':
			// No token --> no visit
			if(!sessionStorage.getItem('token')){
			 	location.href = '/login';
			 	return;
			}else{
				$('#area').attr('href','/logout').text(' Logout');
			}

			// GET All ziks for the homepage
			launchAjaxRequest('/ziks/by/title', null,null
				,function (datas) {
					var list = $('#listing');
					list.append('<h2>All ziks added</h2>');
					list.append(datas);
				}
				, function(data) {	console.log('Error Index : '+data);	}
			);

			// Send any form
			 $('form').submit(function (e) {
			 	var inputs = this;
			 	console.log(inputs);
			 	e.preventDefault();
			 });




		break;

		case '/login' :
			// if click on the submit btn, call this fct
			$('#send').click(function (e){
				var pseudo =  $('#pseudo').val() ,passwd = $('#passwd').val();
				e.preventDefault(); // Block the default event
				if(sessionStorage){ // If the sessionStore exists
					launchAjaxRequest('/login','POST',{'pseudo' :pseudo ,'passwd' : passwd},
						function (data){ // If the AJAX Request is okay ( Status : 200)
							console.log("Token de %s  ==> %s",pseudo,data);
							sessionStorage.setItem('token',data); // SAve the token in the sessionStorage
							window.location.href = '/'; // Redirect to the homePage
						}
						,function (data){
							console.log(data.responseText);
					});
				}else{
					console.log("The session Storage is not supported ! Please active JavaScript to use it");
				}
			});

			break;

		case '/logout' :
			launchAjaxRequest('/logout',null,null,
				function(datas) {
				    sessionStorage.removeItem('token');
				    window.location.href = '/'; // Redirect to the homePage
				}
			);
			break;

		case '/signup' :

			break;
		default:
				// No token --> no visit
			if(!sessionStorage.getItem('token'))
			 	location.href = '/login';
			break;

	}




});
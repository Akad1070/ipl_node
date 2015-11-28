/**
 * Launch an AJAX Request with the def settings
 */
function launchAjaxRequest(_url,_method, _data,cbDone,cbFail){
	// To notify the use that requeest in executing
	$('body').prepend('<div class="flash info"><span>Workin..</span></div>');

	var reqAjax =  $.ajax({
			headers: {
				'Accept' : 'text/javascript; charset=utf-8'
				, 'api-token' : sessionStorage.getItem('token')
			}
			,async:true
			,url  : _url
			,method : _method || 'GET'
			,data : _data
	});

	if(cbDone)
		reqAjax.done(function (data) {
			setFlash('', 'error');
			cbDone(data);
		});
	if(cbFail)
		reqAjax.fail(function (xhr, textStatus, err) {
			setFlash(xhr.responseText, 'error');
			cbFail(xhr.responseText);
		});

	return reqAjax;
}

function setFlash(msg, status) {
	$('.flash').remove();
	$('body').prepend('<div class="flash '+status+'"><span>' + msg + '</span></div>');
}





$(function() {

	console.log(location.pathname);

	var hash = window.location;
	console.log(hash);








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
			launchAjaxRequest('/api/ziks', null,null
				,function (datas) {
					var musics = $('#musics');
					musics.append('<h2>All ziks added</h2>');
					datas.forEach(function (data){
						musics.append('<label><b>'+data.author+'</b> --- '+data.title +'<label>');
						musics.append('<br/>');
					});
				}
				, function(data) {	console.log('Error Index : '+data);	}
			);

			$('a').click(function(e) {
				e.preventDefault();
				var url = e.target.getAttribute("href");
				launchAjaxRequest(url,null,null
					,function(datas) {
						if(url === '/logout'){
							sessionStorage.removeItem('token');
				    		window.location.href = '/'; // Redirect to the homePage
						}else{
							//alert(datas);
							//$('html').html($(datas));
							document.getElementsByTagName('html')[0].innerHTML = datas;
						}
					},function(err) {
						if(err.responseText === 'TokenExpiredError'){
							window.location.href = '/login';
							$('.container').append('<p>Your session has expires. Please login again to continue.<p>' );
						}
					}
			);
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
			break

		case '/signup' :

			break;
		default:
			// If the current page isn't login
				// No token --> no visit
			if(!sessionStorage.getItem('token')){
			 	location.href = '/login';
			 	return;
			}
			break;

	}




});
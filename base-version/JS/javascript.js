window.DEFAULT_COLOR = 'rgba(255,255,255,.0)';

$(document).ready(function(e) {
	LoadHelp();
	
	// Get budget from 2015
	$.get('/api/budget/2015', function (data2015) {
		window.categoriasGobierno2015 = ApiToBudget(data2015);
		window.presupuestoTotal = 0;
		window.categoriasGobierno2015.forEach(function(cat) {
			window.presupuestoTotal += parseFloat(cat.presupuesto);
		});

		// Get categories
		$.get('/api/categories', function (dataCategories) {
			CargarDefault(dataCategories, window.presupuestoTotal);

			// Get average budget
			$.get('/api/mybudget/average', function (data) {
				window.categoriasAverage = ApiToAverage(data);

				// Decidir que hacer en base al hash de la url y la cookie
				var hash = document.location.href.split('#')[1];
				var cookie = getCookie('mybudget');

				if (hash && hash !== '')
					// Get budget from id
					$.get('/api/mybudget/' + hash, function (dataHash) {
						var data = ApiToBudget(dataHash);
						if (cookie)
							if (hash == cookie)
							{
								window.editID = hash;
								// Cargar el budget del identificador del hash y SI permitir edicición
								CargaJuego(data, true);
							}
							else
								// Cargar el budget del identificador del hash y NO permitir edicición
								CargaJuego(data, false);
						else
							CargaJuego(data, false);
					}).fail(function() {
					    CargarInicio();
					});

				else if (cookie)
					// Get budget from id
					$.get('/api/mybudget/'+cookie, function (dataHash) {
						var data = ApiToBudget(dataHash);
						CargaJuego(data, true);
					}).fail(function() {
					    CargarInicio();
					});
				else
					CargarInicio();
			});
		});
	});
});

/**
 * Cargar botón de ayuda
 */
function LoadHelp()
{
	var helpButton = CrearElemento('div', 'buttonHeader helpButton');
	$(helpButton).html('Ayuda');
	$(helpButton).click(function(e) {
		$('.helpPanel').slideToggle();
	});
	$('.buttonsWrapper-left').append(helpButton);

		var helpPanel = CrearElemento('div','helpPanel');
		$(helpPanel).html(
			'Arma tu presupuesto y haz pública tu forma de priorizar las necesidades '
				+ 'de nuestro país. <br />1. Arrastra con tu mouse sobre las flechas '
				+ 'que aparecerán en cada bloque. <br /> 2. Arrastra hacia la derecha '
				+ 'o izquierda para asignar el presupuesto de cada rubro. <br /> 3. Comparte '
				+ 'tu visión del presupuesto a través de las redes sociales.'
		);

		$('body > .arma-container').append(helpPanel);
}

/**
 * Cargar splash screen 'Si tuvieras el poder...'
 */
function CargarInicio()
{
	var sky = CrearElemento('div');

	var	titulo = CrearElemento('div', 'title');

	$(titulo).html('ARMA TU PRESUPUESTO');
	$('#inicio').append(titulo);

	var	subTitulo = CrearElemento('div', 'subTitle');
	$(subTitulo).html(
		'Si tuvieras el <strong>poder de decidir</strong> cómo gastar <br />estos '
			+ 'Q70 mil 600 millones ¿Cambiarías algo? <br />'
			+ 'Arma tu presupuesto e incide en las decisiones haciéndote escuchar.'
	);

	$('#inicio').append(subTitulo);
	
	var iniciarJuego = CrearElemento('div', 'buttonIniciarJuego');
	$(iniciarJuego).html('Comenzar');
	$(iniciarJuego).click(function(e) {
		CargaJuego(window.categoriasDefault, true);
    });

	$('#inicio').append(iniciarJuego);
}

/**
 * Cargar pantalla inicial de juego, ya sea en modo edición o no
 *
 * @param {[type]} _data   [description]
 * @param {[type]} edicion [description]
 */
function CargaJuego(_data, edicion)
{
	$('#resultados').html('');

	var data = $.extend(true, [], _data);
	CargarData('#juego', data, false, true);
	
	$('.buttonsWrapper-right').html('');

	var reiniciarJuego = CrearElemento('div', 'buttonHeader addButton');
	$(reiniciarJuego).html('Crear Nuevo');
	$(reiniciarJuego).click(function(e) {
		CargaJuego(window.categoriasDefault, true);
		$(terminarJuego).fadeIn('fast');
	});
	$('.buttonsWrapper-right').append(reiniciarJuego);

	if (edicion)
	{
		var terminarJuego = CrearElemento('div', 'buttonHeader finishButton');
		$(terminarJuego).html('Terminar');
		$(terminarJuego).click(function(e) {
			CargarResultados(data);
			// Guardar resultado en base de datos
			var saveData = BudgetToApi(data);
			GuardarData(saveData, function (respuesta)
			{
				if(respuesta.id)
					window.editID = respuesta.id;
				else if(respuesta._id)
					window.editID = respuesta._id;
				var cookieName = 'mybudget';
				var expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + 365);

				// Crear cookie con un identificador del resultado
				document.cookie = cookieName
					+ '='
					+ window.editID
					+ ';max-age='
					+ 60*60*24*365
					+ ';expires='
					+ expireDate.toGMTString();

				// Agregar el identificador en la url
				SetURL(window.editID);
			});
		});
		$('.buttonsWrapper-right').append(terminarJuego);

		$(reiniciarJuego).html('Reiniciar');
		$(reiniciarJuego).addClass('resetButton');

		var dineroTotal = CrearElemento('div','total-dinero');
		$(dineroTotal).html('Presupuesto total: ' + FormateoDinero(window.presupuestoTotal));
		$('#juego').append(dineroTotal);

		// Interaccion
		$('.item-container:first').resizable({
			handles: "e",
			autoHide: true,
			resize: function( event, ui ) {
				var presupuesto = (ui.size.width + 2) / window.anchoTotal * window.presupuestoTotal;

				$(ui.element)
					.children('.textDataContainer')
					.children('.presupuestoCategoria')
					.html(FormateoDinero(presupuesto));

				dif = ui.originalSize.width - ui.element.outerWidth(true);
				siguientes = $('.ui-resizable-resizing')
					.nextAll()
					.filter(function(index, e) {
						return (
							dif > 0
							|| (
								dif < 0 && $(e).outerWidth(true) > 12
							)
						);
					});

				var sumaCategoria = (dif + 2) / siguientes.length;
				siguientes.each(function(index, element) {
					var anchoCategoria = parseFloat($(element).attr('data-presupuesto')) / window.presupuestoTotal * window.anchoTotal
						+ sumaCategoria;

					var presupuesto = anchoCategoria / window.anchoTotal * window.presupuestoTotal;

					$(this)
						.children('.textDataContainer')
						.children('.presupuestoCategoria')
						.html(FormateoDinero(presupuesto));

					$(element).css('width', anchoCategoria + 'px');
				});

				ui.element.css('width', ui.size.width + 'px');
			},
			stop: function(event, ui) {
				$(data).each(function(index, element) {
					RecalcularPresupuesto(element);
				});
			}
		});

		$('.item-container:not(:first):not(:last)').resizable({
			handles: "w,e",
			autoHide: true,
			resize: function( event, ui ) {
				var direction = 'left';
				var dif = ui.position.left - ui.originalPosition.left;
				var siguientes = $('.ui-resizable-resizing').prevAll().filter(function(index, e){ return ( dif > 0 || (dif < 0 && $(e).outerWidth(true) > 0)) });
				if(dif == 0)
				{
					direction = 'right';
					dif = ui.originalSize.width - ui.size.width;
					siguientes = $('.ui-resizable-resizing').nextAll().filter(function(index, e){ return ( dif > 0 || (dif < 0 && $(e).outerWidth(true) > 0)) });
				}
				var sumaCategoria = (dif+2) / siguientes.length;
	
				var presupuesto = (ui.size.width + 2) / window.anchoTotal * window.presupuestoTotal;
				$(ui.element).children('.textDataContainer').children('.presupuestoCategoria').html(FormateoDinero(presupuesto));
	
				siguientes.each(function(index, element) {
					var anchoCategoria = parseFloat($(element).attr('data-presupuesto')) / window.presupuestoTotal * window.anchoTotal + sumaCategoria;
					$(element).css('width', anchoCategoria + 'px');
					
					var presupuesto = anchoCategoria / window.anchoTotal * window.presupuestoTotal;
					$(this).children('.textDataContainer').children('.presupuestoCategoria').html(FormateoDinero(presupuesto));
				});
				
				if(direction == 'right')
					ui.element.css('width', ui.size.width + 'px');
				else
				{
					ui.element.css('margin-left', -dif + 'px');
					ui.element.css('margin-right', dif + 'px');
				}
			},
			stop: function(event, ui)
			{
				ui.element.css('left', ui.position.left + SinPx(ui.element.css('margin-left')));
				ui.element.css('margin-left', 0 + 'px');
				ui.element.css('margin-right', 0 + 'px');
				$(data).each(function(index, element) {
					RecalcularPresupuesto(element);
				});
			}
		});
		$('.item-container:last').resizable({
			handles: "w",
			autoHide: true,
			resize: function( event, ui ) {
				var dif = ui.position.left - ui.originalPosition.left;
				var siguientes = $('.ui-resizable-resizing').prevAll().filter(function(index, e){ return ( dif > 0 || (dif < 0 && $(e).outerWidth(true) > 12)) });
				var sumaCategoria = (dif+2) / siguientes.length;
	
				var presupuesto = (ui.size.width + 2) / window.anchoTotal * window.presupuestoTotal;
				$(ui.element).children('.textDataContainer').children('.presupuestoCategoria').html(FormateoDinero(presupuesto));

				siguientes.each(function(index, element) {
					var anchoCategoria = parseFloat($(element).attr('data-presupuesto')) / window.presupuestoTotal * window.anchoTotal + sumaCategoria;
					$(element).css('width', anchoCategoria + 'px');
					
					var presupuesto = anchoCategoria / window.anchoTotal * window.presupuestoTotal;
					$(this).children('.textDataContainer').children('.presupuestoCategoria').html(FormateoDinero(presupuesto));
				});
				ui.element.css('margin-left', -dif + 'px');
				ui.element.css('margin-right', dif + 'px');
			},
			stop: function(event, ui)
			{
				ui.element.css('left', ui.position.left + SinPx(ui.element.css('margin-left')));
				ui.element.css('margin-left', 0 + 'px');
				ui.element.css('margin-right', 0 + 'px');
				$(data).each(function(index, element) {
					RecalcularPresupuesto(element);
				});
			}
		});
	}
	else
	{
		CargarData('#juego', data, false, true);
	}
	// Desplazamiento hacia el contenedor del juego
	$('.header').addClass('solid');
	$('.headerName').fadeIn();
	$('.item-container').css('border-color', 'rgba(0,0,0,.1)');
	$('.container-wrapper').animate({top: '-100%'}, 1000, function() {
		setTimeout(function(){
			$(dineroTotal).slideDown('fast');
		}, 200);
	});
}

function CargarResultados(data)
{
	$('.finishButton').animate({opacity:0}, 500, function(){
		$('.finishButton').hide();
	});
	
	var	contenedor1 = CrearElemento('div', 'inset-container');
	$('#resultados').append(CrearElemento('div', 'wrapper-half-height').append(contenedor1));
		$(contenedor1).append(CrearElemento('div','wrapper'));

		var wrapper1 = CrearElemento('div','wrapper-bottom');
		$(contenedor1).append(wrapper1);

			var titulo1 = CrearElemento('div','headerName');
			$(titulo1).html('Tu presupuesto');
			$(wrapper1).append(titulo1);
	
			var shareFacebook = CrearElemento('div','shareButtonFacebook');
			$(shareFacebook).html('Comparte tu Presupuesto en Facebook');
			$(shareFacebook).click(function(e) {
                ShareButtonFacebook(
                	window.location.href,
                	'Señor Presidente, ¡así prioricé el gasto de mi país!',
                	'Ejerzo mis derechos como ciudadano guatemalteco, conociendo el Presupuesto nacional '
                		+ 'y compartiendo mi punto de vista sobre el uso de '
                		+ 'nuestros impuestos. #YoCuidoMisImpuestos',
            		location.origin + location.pathname + 'IMG/red/Cuadro2.gif'
        		);
            });
			$(wrapper1).append(shareFacebook);
	
			var shareTwitter = CrearElemento('div','shareButtonTwitter');
			$(shareTwitter).html('Comparte tu Presupuesto en Twitter');
			$(shareTwitter).click(function(e) {
                ShareButtonTwitter(window.location.href, '¡Así prioricé el Presupuesto de mi país!  Me informo, interactúo e incido. ');
            });
			$(wrapper1).append(shareTwitter);

	var	contenedor2 = CrearElemento('div', 'inset-container');
	$('#resultados').append(CrearElemento('div', 'wrapper-half-height').append(contenedor2));
		$(contenedor2).append(CrearElemento('div','wrapper'));
		
		var wrapper2 = CrearElemento('div','wrapper-bottom');
		$(contenedor2).append(wrapper2);

			var botonTitulo2Hoy = CrearElemento('div','headerName button selected');
			$(botonTitulo2Hoy).html('Guatemala hoy');
			$(botonTitulo2Hoy).click(function(e) {
                CargarData(contenedor2.children()[0], categoriasGobierno2015, true, false);
				$('.selected').removeClass('selected');
				$(this).addClass('selected');
            });
			$(wrapper2).append(botonTitulo2Hoy);
			
			var botonTitulo2Promedio = CrearElemento('div','headerName button');
			$(botonTitulo2Promedio).html('Presupuesto Ciudadano (Promedio)');
			$(botonTitulo2Promedio).click(function(e) {
                CargarData(contenedor2.children()[0], window.categoriasAverage, true, false);
				$('.selected').removeClass('selected');
				$(this).addClass('selected');
            });
			$(wrapper2).append(botonTitulo2Promedio);
		

	CargarData(contenedor1.children()[0], data, true, false);
	CargarData(contenedor2.children()[0], categoriasGobierno2015, true, false);

	var base = CrearElemento('div', 'items-base');
	$('#resultados').append(base);

	var masInfo = CrearElemento('div', 'buttonIniciarJuego');
	$(masInfo).html('Más información');
	$(masInfo).click(function(e) {
		CargarMasInfo();
	});
	$('#resultados').append(masInfo);

	$('.container-wrapper').animate({top: '-200%'}, 1000, function()
		{
			setTimeout(function(){
				var i = 1;
				$('.inset-container').each(function(index, element) {
					setTimeout(function(){
						$(element).animate({opacity:1}, 700);
					}, i * 100);
					i+=4;
                });
			}, 100);
		}
	);
}

function CargarMasInfo()
{
	// Información
	var info = {
		titulo: 'Paso a paso: el camino de mis impuestos',
		descripcion:
			"La <strong>Superintendencia de Administración Tributaria (SAT)</strong> recauda todos los impuestos de personas individuales o empresas.<br/>"
			+ "Los fondos recaudados se trasladan al <strong>Ministerio de Finanzas (MINFIN)</strong>.<br/>"
			+ "El <strong>Organismo Ejecutivo</strong> elabora el <strong>Presupuesto General de Ingresos y Egresos de la Nación</strong>. <br/>"
			+ "El <strong>Congreso de la República</strong> discute y aprueba el Presupuesto.<br/>"
			+ "El <strong>MINFIN</strong> distribuye los fondos a todas las entidades del Estado, de acuerdo con lo establecido en el Presupuesto.<br/>"
			+ "Cada entidad debe evidenciar el apropiado gasto del dinero a través de la prestación oportuna de los servicios que le han sido designados.<br/>"
			+ "La <strong>Contraloría General de Cuentas (CGC)</strong> debe fiscalizar el uso apropiado de los fondos.<br/>"
	};

	//Cargar información en #datos
	var $datos = $('#datos');

	var $titulo = $(CrearElemento('div', 'title'));
	$titulo.html(info.titulo);

	var $descripcion = $(CrearElemento('div', 'subTitle'));
	$descripcion.html(info.descripcion);

	var $volverInicio = $(CrearElemento('div', 'buttonIniciarJuego'));
	$volverInicio.html('Volver a armar');
	$volverInicio.click(function(e) {
		// vaciamos el contenido de #juego
		$('#juego').html('');
		// y volvemos a ejecutar CargaJuego
		CargaJuego(window.categoriasDefault, true);

		// esperamos que termine de subír y borramos los resultados
		// y los datos
		setTimeout(function ()
		{
			$('#resultados').html('');
			$datos.html('');
			$('.finishButton').show();
		}, 1000)
	});

	$datos.append($titulo);
	$datos.append($descripcion);
	$datos.append($volverInicio);

	//Desplazamiento hacia el contenedor de más info
	$('.container-wrapper').animate({top: '-300%'}, 1000, function()
		{
			setTimeout(function(){
				$('.item-container').css('border-color', 'rgba(0,0,0,.1)');
			}, 200);
		}
	);
}

function CargarData(contenedor, data, porcentaje, conDescripcion)
{
	// Borrar el contenido del contenedor
	$(contenedor).html('');

	// Crear del cielo, calle base y contenedor de categorias
	var sky = CrearElemento('div', 'street-section-sky');

	var base = CrearElemento('div', 'items-base');
	$(contenedor).append(base);

	var itemsContainer = CrearElemento('div', 'items-container');
	$(contenedor).append(itemsContainer);

	// Calcular presupuestoTotal en base a la suma de los presupuestos de todas las categoiras
	window.presupuestoTotal = 0;
	data.forEach(function(cat){window.presupuestoTotal += parseFloat(cat.presupuesto);});
	
	window.anchoTotal = $(itemsContainer).outerWidth(true);

	// Cargar cada categoria en el contenedor con un ancho relativo a su presupuesto
	var porcentajePromedio = 100 / data.length;
	var leftAcumulador = 0;
	data.sort(compare).forEach(function(cat)
	{
		var anchoCategoria = parseFloat(cat.presupuesto) / window.presupuestoTotal * window.anchoTotal;

		var itemCategoria = document.createElement('div');
		$(itemCategoria).addClass('item-container');
		$(itemCategoria).attr('id', 'panelCategoria'+cat.codigo);
		$(itemCategoria).attr('data-codigo', cat.codigo);
		$(itemCategoria).attr('data-presupuesto', cat.presupuesto);
		$(itemCategoria).css('width', Math.floor(anchoCategoria)+'px');
		$(itemsContainer).append(itemCategoria);
		
		var dataContainer = document.createElement('div');
		$(dataContainer).addClass('dataContainer');
		$(dataContainer).css('background-color', cat.color);
		$(itemCategoria).append(dataContainer);
		
		var textContainer = CrearElemento('div', 'textDataContainer');
		$(itemCategoria).append(textContainer);
		
		var nombreCategoria = document.createElement('div');
		$(nombreCategoria).addClass('nombreCategoria');
		$(nombreCategoria).html(cat.nombre);
		$(nombreCategoria).attr('title', cat.nombre);
		$(textContainer).append(nombreCategoria);

		if(porcentaje)
		{
			var porcentajeCategoria = CrearElemento('div', 'porcentajeCategoria');
			var dif = Math.round((cat.presupuesto * 100 / presupuestoTotal) * 100) / 100;
			$(porcentajeCategoria).html(dif+'%');
			$(textContainer).append(porcentajeCategoria);
		}

		var presupuestoCategoria = document.createElement('div');
		$(presupuestoCategoria).addClass('presupuestoCategoria');
		$(presupuestoCategoria).html(FormateoDinero(cat.presupuesto));
		$(textContainer).append(presupuestoCategoria);
		
		var imagenesCategoriaContainer = document.createElement('div');
		$(imagenesCategoriaContainer).addClass('imagenesCategoriaContainer');
		$(dataContainer).append(imagenesCategoriaContainer);

		if(cat.info && conDescripcion)
		{
			var infoCategoriaContainer = document.createElement('div');
			$(infoCategoriaContainer).addClass('infoCategoriaContainer');
			$(infoCategoriaContainer).html(cat.info);
			$(textContainer).append(infoCategoriaContainer);
		}
		
		var imagenCategoria = document.createElement('div');
		$(imagenCategoria).addClass('imagenCategoria');
		$(imagenCategoria).css('background-image', 'url(IMG/categorias/'+cat.imagen+')');
		$(imagenesCategoriaContainer).append(imagenCategoria);
	});
}

function RecalcularPresupuesto(element)
{
	var e = $('.item-container[data-codigo="'+element.codigo+'"]');
	var ancho = e.outerWidth(true);
	element.presupuesto = ancho / window.anchoTotal * window.presupuestoTotal;
	$(e).children('.presupuestoCategoria').html(FormateoDinero(element.presupuesto));
	$(e).attr('data-presupuesto', element.presupuesto);
}

function SinPx(string)
{
	return parseFloat(string.split('px')[0]);
}

function SinPorcentaje(string)
{
	return parseFloat(string.split('%')[0]);
}

function Porcentaje(valor, total)
{
	return valor / total * 100;
}

function FormateoDinero(num)
{
	var str = (num/1000000)
		.toFixed(2)
		.toString()
		.split('.');

	console.log()

    if (str[0].length >= 4) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    return 'Q' + str.join('.') + ' M';
}

function CrearElemento(tag, className)
{
	var presupuestoCategoria = document.createElement(tag);

	$(presupuestoCategoria).addClass(className);

	return $(presupuestoCategoria);
}

function compare(a,b) {
  if (a.nombre < b.nombre)
    return -1;
  if (a.nombre > b.nombre)
    return 1;
  return 0;
}

function SetURL(id)
{
	var title = 'Arma tu presupuesto - ciudad ' + id;
	var url = window.location.origin + location.pathname + '#' + id;
    if (typeof (history.pushState) != "undefined") 
	{
		document.title = title;
        var obj = { Title: title, Url: url };
        history.pushState(obj, obj.Title, obj.Url);
    }
	//TODO: crear evento de analytics
}

function ShareButtonTwitter(url, message)
{
	window.open('https://twitter.com/intent/tweet?'+
	'related=PartidodelaRed&'+
	'text='+ encodeURIComponent(message + url + ' #YoCuidoMisImpuestos @jimmymoralesgt'),
	'Compartí en Twitter', 'width=900,height=300,menubar=no,status=no,titlebar=no,top=200,left='+(screen.width-900)/2);
}

function ShareButtonFacebook(url, title, message, image)
{
	window.open(
		'http://www.facebook.com/dialog/feed?app_id=1077578065594362' +
			'&link='+encodeURIComponent(url) +
			'&picture=' + encodeURIComponent(image) +
			'&name=' + encodeURIComponent(title) +
			'&caption=' + 'via www.redciudadana.org - Red Ciudadana' +
			'&description=' + encodeURIComponent(message) +
			'&redirect_uri=' + location.origin + location.pathname + 'close.html' +
			'&display=popup'
		,
		'Comparte en Facebook',
		'width=900,height=300,menubar=no,status=no,titlebar=no,top=200,left='+(screen.width-900)/2
	);
}

function GuardarData(data, cb)
{
	$.ajax({
		type: window.editID ? 'PUT' : 'POST',
		url: '/api/mybudget/',
		data: data,
		dataType: 'json'
	}).always(cb);
}

function ApiToBudget(_data)
{
	var data = null;

	if (_data.rows)
		data = _data.rows;
	else
		data = _data;

	return data.map(function(budget) {
		return {
			codigo: budget.category._id,
			nombre: budget.category.name,
			color: DEFAULT_COLOR,
			presupuesto: budget.amount,
			imagen: budget.category.image,
			info: InfoCategory(budget.category.name)
		}
	})
}

function ApiToAverage(data) {
	return data.map(function(budget) {
		return {
			codigo: budget.category._id,
			nombre: budget.category.name,
			color: DEFAULT_COLOR,
			presupuesto: budget.average,
			imagen: budget.category.image,
			info: InfoCategory(budget.category.name)
		}
	});
}

function BudgetToApi(_data)
{
	var data = new Object();
	if(window.editID)
		data.id = window.editID;

	data.rows = [];
	_data.forEach(function(Item)
	{
		data.rows.push(
		{
			category: Item.codigo,
			amount: Item.presupuesto
		});
	});
	return data;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ')
    		c = c.substring(1);

        if (c.indexOf(name) == 0)
        	return c.substring(name.length,c.length);
    }

    return "";
}

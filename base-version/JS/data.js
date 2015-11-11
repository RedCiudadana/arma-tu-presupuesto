function CargarDefault(categories, totalBudget)
{
	window.categoriasDefault = categories.map(function(category) {
		return {
			codigo: category._id,
			nombre: category.name,
			color: DEFAULT_COLOR,
			presupuesto: totalBudget / categories.length,
			imagen: category.image,
			info: InfoCategory(category.name)
		}
	})
}

function InfoCategory(cat)
{
	switch(cat)
	{
		case 'Servicios públicos generales':
			return "Órganos ejecutivos y legislativos, asuntos financieros y fiscales, asuntos "
				+ "exteriores, Ayuda económica exterior, Transacciones de la deuda pública y "
				+ "Transferencias de carácter general entre diferentes niveles de gobierno";
			break;

		case 'Defensa':
			return "Defensa militar, Defensa civil, Ayuda militar al exterior, Investigación "
				+ "y desarrollo relacionados con la defensa y Defensa";
			break;

		case 'Orden público y seguridad':
			return "Servicios de policía, Servicios de protección contra incendios, Tribunales "
				+ "de justicia, Prisiones, Investigación y desarrollo relacionados con el "
				+ "orden público y la seguridad y Orden público y seguridad";
			break;

		case 'Asuntos económicos':
			return "Asuntos económicos, comerciales y laborales en general, Agricultura, "
				+ "silvicultura, pesca y caza, Combustibles y energía, Minería, "
				+ "manufacturas y construcción, Transporte, Comunicaciones, Otras industrias, "
				+ "Investigación y desarrollo relacionados con asuntos económicos";
			break;

		case 'Protección del medio ambiente':
			return "Ordenación de desechos, Ordenación de aguas residuales, Reducción de la "
				+ "contaminación, Protección de la diversidad biológica y del paisaje, "
				+ "Investigación y desarrollo relacionados con la protección del medio "
				+ "ambiente y Protección del medio ambiente";
			break;

		case 'Vivienda y servicios comunitarios':
			return "Urbanización, Desarrollo comunitario, Abastecimiento de agua, Alumbrado "
				+ "público, Investigación y desarrollo relacionados con la vivienda y los "
				+ "servicios comunitarios, Vivienda y servicios comunitarios";
			break;

		case 'Salud':
			return "Productos, útiles y equipo médicos, Servicios para pacientes "
				+ "externos, Servicios hospitalarios, Servicios de salud pública, "
				+ "Investigación y desarrollo relacionados con la salud y Salud";
			break;

		case 'Actividades recreativas, cultura y religión':
			return "Servicios recreativos y deportivos, Servicios culturales, "
				+ "Servicios de radio y televisión y servicios editoriales, "
				+ "Servicios religiosos y otros servicios comunitarios, "
				+ "Investigación y desarrollo relacionados con esparcimiento, "
				+ "cultura y religión, Actividades recreativas y cultura y religión";
			break;

		case 'Educación':
			return "Enseñanza preescolar y enseñanza primaria, Enseñanza secundaria, "
				+ "Enseñanza postsecundaria no terciaria, Enseñanza terciaria, "
				+ "Enseñanza no atribuible a ningún nivel, Servicios auxiliares de "
				+ "la educación, Investigación y desarrollo relacionados con la educación "
				+ "y Enseñanza";
			break;

		case 'Protección social':
			return "Enfermedad e incapacidad, Edad avanzada, Supérstites. "
				+ "Familia e hijos, Desempleo, Vivienda, Exclusión social, "
				+ "Investigación y desarrollo relacionados con la protección "
				+ "social y Protección social";
			break;
	}
}

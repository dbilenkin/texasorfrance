function HighScoresCtrl($scope) {

	$(function() {

		groupedResults = {
			states : {},
			countries : {},
			statesVsCountries : {}
		}

		$('#highscores a').on('show.bs.tab', function(e) {
			var geographyType = $(this).attr('href');
			getHighScores(geographyType.substring(1));
		})

		getHighScores("statesVsCountries");

	});

}
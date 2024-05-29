var app = app || {};

/* has jquery object */
app.hasJqueryObject = function ($elem) { return $elem.length > 0; };

/* init check console */
app.console = {
	log : function(name){ console.log('pubLog : ' + name + ' is init'); },
	reset : function(name){ console.log('Reset ' + name + ' Complete'); },
}

/* Module Event */
app.moduleEvent = {
	CLICK_GNB : 'click.gnb',
	CLICK_BACK : 'click.back',
	CLICK_TABS : 'click.tabs',
	CLICK_ACCOR : 'click.accor',
	CLICK_POPUP : 'click.popup',
	SCROLL_WINDOW : 'scroll.window',
}

/*******************************
 * UI Module
 *******************************/
/* 탭메뉴 */
app.tabs = {
	name: 'app.tabs',

	init: function() {
		this.createSelector();
		this.addEvents();
		app.console.log(this.name);
	},

	createSelector: function() {
		this.wrapName = '[data-ui=tabs]';
		this.ctrlName = '.ctrlTab';
		this.$wrap = app.$body.find(this.wrapName);
		this.$ctrl = this.$wrap.find(this.ctrlName);
	},

	addEvents: function() {
		this.$ctrl.off('click.tabs').on('click.tabs', this.handleClick.bind(this));
	},

	handleClick: function(e) {
		e.preventDefault();

		$(e.currentTarget).addClass('active').siblings().removeClass('active');
		var targetId = $(e.currentTarget).attr('href');
		$(targetId).show().siblings().hide();
	}
}

/* GNB 스크롤 이동 */
app.goScroll = {
	name: 'app.goScroll',

	init: function() {
		this.createSelector();
		this.addEvents();
		app.console.log(this.name);
	},

	createSelector: function() {
		this.ctrlName = '[data-href]';
		this.$ctrl = app.$body.find(this.ctrlName);
	},

	addEvents: function() {
		this.$ctrl.on('click', this.handleClick.bind(this));
	},

	handleClick: function(e) {
		e.preventDefault();

		var href = $(e.currentTarget).data('href');
		var offsetTop = $('[data-anchor=' + href + ']').offset().top;

		$('html, body').stop().animate({
			scrollTop: offsetTop
		}, 300);
	},
}

/* GNB 스크롤 감지 */
app.onScroll = {
	name: 'app.onScroll',

	init: function() {
		this.createSelector();
		this.addEvents();
		app.console.log(this.name);
	},

	createSelector: function() {
		this.$gnb = app.$body.find('.gnb');
	},

	addEvents: function() {
		app.$window.on('scroll', this.handleScroll.bind(this));
	},

	handleScroll: function() {
		var winTop = app.$window.scrollTop();
		var ancHome = app.$body.find('[data-anchor=home]').offset().top;
		var ancAbout = Math.floor(app.$body.find('[data-anchor=about]').offset().top);
		var ancWork = Math.floor(app.$body.find('[data-anchor=work]').offset().top);
		var ancContact = Math.floor(app.$body.find('[data-anchor=contact]').offset().top);

		if (winTop >= ancHome && winTop < ancAbout) {
			this._setActiveGnb(0);
		} else if (winTop >= ancAbout && winTop < ancWork) {
			this._setActiveGnb(1);
		} else if (winTop >= ancWork && winTop < ancContact) {
			this._setActiveGnb(2);
		} else if (winTop >= ancContact) {
			this._setActiveGnb(3);
		}
	},

	_setActiveGnb: function(index) {
		this.$gnb.find('> li').eq(index).addClass('active').siblings().removeClass('active');
	},
}

/* Swiper */
app.swiper = {
	name: 'app.swiper',

	init: function() {
		this.createSelector();
		this.addEvents();
		app.console.log(this.name);
	},

	createSelector: function() {
		this.wrapName = '[data-ui=swiper]';
	},

	addEvents: function() {
		var swiper = new Swiper(this.wrapName, {
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			slidesPerView: 2,
			slidesPerGroup: 2,
		});
	},
};

/* 팝업 */
app.popup = {
	name: 'app.popup',

	init: function() {
		this.createSelector();
		this.addEvents();
		app.console.log(this.name);
	},

	createSelector: function() {
		this.ctrlOpenName = '[data-ui=popup]';
		this.ctrlCloseName = '.popup_close';
		this.$ctrlOpen = app.$body.find(this.ctrlOpenName);
		this.$ctrlClose = app.$body.find(this.ctrlCloseName);
	},

	addEvents: function() {
		this.$ctrlOpen.on('click.popup', this.handleClickOpen.bind(this));
		this.$ctrlClose.on('click.popup', this.handleClickClose.bind(this));
	},

	handleClickOpen: function(e) {
		e.preventDefault();

		var targetId = $(e.currentTarget).attr('href');
		if ( !$(targetId).length ) return;

		app.$body.find('.popup_wrap').removeClass('active');
		app.$body.css('overflow', 'hidden');
		$(targetId).addClass('show');
		$(targetId).addClass('active');
	},

	handleClickClose: function(e) {
		e.preventDefault();
		var $wrap = $(e.currentTarget).closest('.popup_wrap');

		app.$body.css('overflow', '');
		$wrap.removeClass('active');
		setTimeout(function() {
			$wrap.removeClass('show');
		}, 300);
	},
};

/*******************************
 * UI Init
 *******************************/
app.UI = {
	init: function(){
		app.hasJqueryObject( app.$body.find('[data-ui=tabs]') ) && app.tabs.init();
		app.hasJqueryObject( app.$body.find('[data-href]') ) && app.goScroll.init();
		app.hasJqueryObject( app.$body.find('[data-ui=swiper]') ) && app.swiper.init();
		app.hasJqueryObject( app.$body.find('[data-ui=popup]') ) && app.popup.init();
		app.onScroll.init();
	},
};

$(function(){
	app.$window = $(window);
	app.$body = $('body');
	app.UI.init();
});

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

// 본문 스크롤 감지
app.onScroll = {
	name: 'app.onScroll',

	init: function() {
		this.createSelector();
		this.addEvents();
		app.console.log(this.name);
	},

	createSelector: function() {
		this.$sliderWrap = app.$body.find('#content');
		this.$sliderItem = this.$sliderWrap.find('> [class^="sec_"]');
		this.$pagingWrap = app.$body.find('#nav .gnb');
		this.$pagingItem = this.$pagingWrap.find('> li');
		this.$pagingCtrl = this.$pagingItem.find('> a');

		this.currentIdx = 0;
		this.animation_state = false;
		this.touchStart = null;
		this.touchEnd = null;

		// 메인 버튼
		this.$mainBtn = app.$body.find('.btn_goabout');
	},

	addEvents: function() {
		this.$sliderItem.each(function(idx) {
			$(this).css('transform', 'translateY(' + (idx * 100) + '%)');
		});

		this.$pagingItem.each(function(idx) {
			$(this).attr('data-slide', idx);
		});

		this.$pagingCtrl.on('click', this.handleClickGNB.bind(this));
		this.$mainBtn.on('click', this.handleClickBtn.bind(this));	// 메인 버튼
		this.$sliderWrap.on('mousewheel', this.handleWheel.bind(this));
		this.$sliderWrap.on('touchstart', this.handleTouchStart.bind(this));
		this.$sliderWrap.on('touchend', this.handleTouchEnd.bind(this));
	},

	handleClickGNB: function(e) {
		if (this.animation_state) return;
		e.preventDefault();

		var idx = $(e.currentTarget).closest('li').attr('data-slide');
		this._gotoNum(idx);
	},

	// 메인 버튼
	handleClickBtn: function() {
		this._gotoNext();
	},

	handleWheel: function(e) {
		if (this.animation_state) return;
		e.preventDefault();

		if(e.originalEvent.deltaY > 0) {
			this._gotoNext();
		} else if(e.originalEvent.deltaY < 0) {
			this._gotoPrev();
		}
	},

	handleTouchStart: function(e) {
		this.touchStart = e.touches[0].screenY;
	},

	handleTouchEnd: function(e) {
		this.touchEnd = e.changedTouches[0].screenY;

		var hasSwiper = $(e.target).closest('.swiper').length;
		var hasPopup = $('.popup_wrap.active').length;
		var hasTabs = $(e.target).closest('.tab_wrap').length;
		if (hasSwiper || hasPopup || hasTabs) return;

		if (this.touchStart < this.touchEnd) {
			this._gotoPrev();
		} else {
			this._gotoNext();
		}
	},

	_gotoNum: function(index) {
		var that = this;
		if (parseInt(index) != this.currentIdx && !this.animation_state) {

			this.animation_state = true;
			setTimeout(function() {
				that.animation_state = false;
			}, 1000);

			this.$pagingItem.eq(this.currentIdx).removeClass('active');
			this.currentIdx = parseInt(index);
			this.$pagingItem.eq(this.currentIdx).addClass('active');

			this.$sliderItem.each(function(idx) {
				$(this).css('transform', 'translateY(' + -(that.currentIdx - idx) * 100 + '%)');
			});
		}
	},

	_gotoNext: function() {
		if (this.currentIdx < this.$pagingItem.length - 1) {
			this._gotoNum(this.currentIdx + 1);
		} else {
			return false;
		}
	},

	_gotoPrev: function() {
		if (this.currentIdx > 0) {
			this._gotoNum(this.currentIdx - 1);
		} else {
			return false;
		}
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
		this.$wrap = app.$body.find('.popup_wrap');
		this.ctrlOpenName = '[data-ui=popup]';
		this.ctrlCloseName = '.popup_close';
		this.$ctrlOpen = app.$body.find(this.ctrlOpenName);
		this.$ctrlClose = app.$body.find(this.ctrlCloseName);
	},

	addEvents: function() {
		this.$ctrlOpen.on('click.popup', this.handleClickOpen.bind(this));
		this.$ctrlClose.on('click.popup', this.handleClickClose.bind(this));

		var that = this;
		this.$wrap.on('click', function(e) {
			if ($(this).has(e.target).length == 0) {
				$(this).find(that.ctrlCloseName).trigger('click');
			}
		});
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

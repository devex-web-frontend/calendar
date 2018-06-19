/**
 * @copyright Devexperts
 *
 * @requires DX
 * @requires DX.Dom
 * @requires DX.Date
 * @requires DX.Bem
 * @requires DX.Event
 */
var Calendar = (function(DX) {
	'use strict';

	var CN_CALENDAR = 'calendar',
		CN_HEADER = CN_CALENDAR + '--header',
		CN_DATES = CN_CALENDAR + '--dates',
		CN_MONTH = CN_CALENDAR + '--month',
		CN_MONTH_CURRENT = CN_MONTH + '-current',
		CN_YEAR = CN_CALENDAR + '--year',
		CN_DAY = CN_CALENDAR + '--day',
		M_PREVIOUS_MONTH = 'prevMonth',
		M_NEXT_MONTH = 'nextMonth',
		M_CURRENT_MONTH = 'currentMonth',
		M_TODAY = 'today',
		M_FIRST_MONTH_DATE = 'firstMonthDate',
		M_LAST_MONTH_DATE = 'lastMonthDate',
		LAST_DAY_INDEX = 6,
		dayOfWeekModifiers = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

	function makeCalendarElement(config) {
		return DX.Dom.createElement('div', {
			className: CN_CALENDAR,
			innerHTML: config.tmpl
		});
	}

	function initElements(calendar) {
		return {
			calendar: calendar,
			header: DX.$$('.' + CN_HEADER, calendar),
			dates: DX.$$('.' + CN_DATES, calendar),
			month: DX.$$('.' + CN_MONTH_CURRENT, calendar),
			year: DX.$$('.' + CN_YEAR, calendar)
		};
	}

	function drawHeader(elements, config) {
		var headerFragment = document.createDocumentFragment(),
			dayAbbrs = config.dayAbbrs;

		for (var i = config.startOfWeekIndex; i > 0; i--) {
			dayAbbrs.push(dayAbbrs.shift());
		}

		dayAbbrs.forEach(function(abbr, index) {
			headerFragment.appendChild(DX.Dom.createElement('span', {
				className: DX.Bem.createModifiedClassName(CN_DAY, [abbr]),
				textContent: config.dayAbbrs[index]
			}));
		});

		elements.header.appendChild(headerFragment);
	}

	function getLastDateOfMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0);
	}

	function nextDate(date) {
		date = DX.Date.clone(date);

		date.setDate(date.getDate() + 1);

		return date;
	}

	function makeCalendarFragment(data) {
		var calendarFragment = document.createDocumentFragment();

		data.forEach(function(dateObject) {
			calendarFragment.appendChild(DX.Dom.createElement('span', {
				className: DX.Bem.createModifiedClassName(CN_DAY, dateObject.modifiers),
				textContent: dateObject.date.getDate(),
				model: dateObject
			}));
		});

		return calendarFragment;
	}

	function getFirstVisibleDate(date, startOfWeekIndex) {
		var firstVisibleDate = DX.Date.clone(date),
			weekStartOffset;

		firstVisibleDate.setDate(1);

		weekStartOffset = 1 - weekStartOffsetCorrection(firstVisibleDate.getDay(), startOfWeekIndex);
		firstVisibleDate.setDate(weekStartOffset);

		return firstVisibleDate;
	}

	function weekStartOffsetCorrection(day, startOfWeekIndex) {
		day = day - startOfWeekIndex;

		if (day < 0) {
			day = day + LAST_DAY_INDEX + 1;
		}

		return day;
	}

	function getTotalVisibleDates(monthDate, startOfWeekIndex) {
		var date = new Date(monthDate),
			firstDate = new Date(date.setDate(1)),
			lastDate = getLastDateOfMonth(date),
			prevMonthVisibleTotal = weekStartOffsetCorrection(firstDate.getDay(), startOfWeekIndex),
			nextMonthVisibleTotal = LAST_DAY_INDEX - weekStartOffsetCorrection(lastDate.getDay(), startOfWeekIndex),
			currentMonthTotal = lastDate.getDate();

		return prevMonthVisibleTotal + currentMonthTotal + nextMonthVisibleTotal;
	}

	function runAllProcessors(dateObject, processors) {
		processors.forEach(function(processor) {
			processor(dateObject);
		});
	}

	function prepareCalendarData(monthDate, processors, config) {
		var firstVisibleDate = getFirstVisibleDate(monthDate, config.startOfWeekIndex),
			totalVisibleDates = getTotalVisibleDates(monthDate, config.startOfWeekIndex),
			data = [],
			date = firstVisibleDate;

		for (var i = 0; i < totalVisibleDates; i++) {
			var modifiers = [dayOfWeekModifiers[date.getDay()]],
				dateObject;

			dateObject = {
				modifiers: modifiers,
				date: date,
				calendarMonth: monthDate
			};

			runAllProcessors(dateObject, processors);

			data.push(dateObject);
			date = nextDate(date);
		}

		return data;
	}

	function todayDateProcessor(dateObject) {
		var today = new Date();

		if (DX.Date.isEqual(today, dateObject.date)) {
			dateObject.modifiers.push(M_TODAY);
		}
	}

	function prevMonthDateProcessor(dateObject) {
		if (DX.Date.isLessMonth(dateObject.date, dateObject.calendarMonth)) {
			dateObject.modifiers.push(M_PREVIOUS_MONTH);
		}
	}

	function nextMonthProcessor(dateObject) {
		if (DX.Date.isGreaterMonth(dateObject.date, dateObject.calendarMonth)) {
			dateObject.modifiers.push(M_NEXT_MONTH);
		}
	}

	function currentMonthProcessor(dateObject) {
		if (DX.Date.isEqualMonth(dateObject.date, dateObject.calendarMonth)) {
			dateObject.modifiers.push(M_CURRENT_MONTH);
		}
	}

	function firstMonthDateProcessor(dateObject) {
		if (dateObject.date.getDate() === 1) {
			dateObject.modifiers.push(M_FIRST_MONTH_DATE);
		}
	}

	function lastMonthDateProcessor(dateObject) {
		var date = dateObject.date,
			lastDateOfMonth = getLastDateOfMonth(date);

		if (date.getDate() === lastDateOfMonth.getDate()) {
			dateObject.modifiers.push(M_LAST_MONTH_DATE);
		}
	}

	return function Calendar(container, config) {
		var elements, processors, currentDate;

		function init() {
			var calendar;

			processors = [];
			config = config ? Object.assign({}, Calendar.config, config) : Calendar.config;

			calendar = makeCalendarElement(config);
			elements = initElements(calendar);

			container.appendChild(elements.calendar);

			initListeners();

			drawHeader(elements, config);
			registerDefaultProcessors();

			DX.Event.trigger(container, Calendar.E_CREATED, {
				detail: {
					block: container,
					eventTarget: container
				}
			});
		}

		function initListeners() {
			elements.dates.addEventListener(DX.Event.CLICK, function(e) {
				var day = DX.Dom.getAscendantByClassName(e.target, CN_DAY);

				if (day) {
					DX.Event.trigger(container, Calendar.E_DAY_SELECTED, {
						detail: {
							dayModel: day.model
						}
					});
				}
			});
		}

		function registerDefaultProcessors() {
			registerProcessor(todayDateProcessor);
			registerProcessor(prevMonthDateProcessor);
			registerProcessor(nextMonthProcessor);
			registerProcessor(currentMonthProcessor);
			registerProcessor(firstMonthDateProcessor);
			registerProcessor(lastMonthDateProcessor);
		}

		function drawMonth(date) {
			var calendarData;

			date = DX.Date.clone(date);
			date.setDate(1);

			calendarData = prepareCalendarData(date, processors, config);
			currentDate = date;

			if (elements.month) {
				elements.month.textContent = config.monthNames[date.getMonth()];
			}

			if (elements.year) {
				elements.year.textContent = date.getFullYear();
			}

			elements.dates.innerHTML = '';
			elements.dates.appendChild(makeCalendarFragment(calendarData));
		}

		function drawPrevMonth(date) {
			var prevDate = DX.Date.decrementMonth(date || currentDate || new Date(new Date().setHours(0,0,0,0)));

			drawMonth(prevDate);
		}

		function drawNextMonth(date) {
			var nextDate = DX.Date.incrementMonth(date || currentDate || new Date(new Date().setHours(0,0,0,0)));

			drawMonth(nextDate);
		}

		function registerProcessor(fn) {
			processors.push(fn);
		}

		function deregisterProcessor(fn) {
			var index = processors.indexOf(fn);

			if (index > -1) {
				delete processors[index];
			}
		}

		function getDate() {
			return DX.Date.clone(currentDate);
		}

		function update() {
			drawMonth(currentDate);
		}

		init();

		this.drawMonth = drawMonth;
		this.drawPrevMonth = drawPrevMonth;
		this.drawNextMonth = drawNextMonth;
		this.registerProcessor = registerProcessor;
		this.deregisterProcessor = deregisterProcessor;
		this.getDate = getDate;
		this.update = update;
		this.getBlock = function() {
			return container;
		};
		this.getEventTarget = function() {
			return container;
		};
	};
})(DX);

Calendar.E_CREATED = 'calendar:created';
Calendar.E_DAY_SELECTED = 'calendar:dayselected';

Calendar.config = {
	dayAbbrs: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
	startOfWeekIndex: 0,
	monthNames: [
		'january',
		'february',
		'march',
		'april',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'november',
		'december'
	],
	tmpl: [
		'<div class=".calendar--info">',
		'<span class="calendar--month calendar--month-current"></span>',
		'<span class="calendar--year"></span>',
		'</div>',
		'<div class="calendar--header"></div>',
		'<div class="calendar--dates"></div>'
	]
};

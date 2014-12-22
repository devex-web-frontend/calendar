describe('Calendar', function() {
	var monthStartsOnSunday = new Date('2010/08/16 16:00'),
		monthEndsOnSaturday = new Date('2012/06/01 12:00'),
		defaultMonth = new Date('2012/02/01 18:00');

	beforeEach(function() {
		document.body.innerHTML = '<div class="calendarWrapper" id="test"></div>';
	});
	afterEach(function() {
		document.body.innerHTML = '';
	});

	describe('Constructor', function() {
		it('should initialize with default template', function() {
			var wrap = document.getElementById('test');

			new Calendar(wrap);

			expect(document.querySelector('.calendar')).not.toBeNull();
			expect(document.querySelector('.calendar--header')).not.toBeNull();
			expect(document.querySelector('.calendar--dates')).not.toBeNull();
			expect(document.querySelector('.calendar--month-current')).not.toBeNull();
			expect(document.querySelector('.calendar--year')).not.toBeNull();
		});

		it('should provide opportunity to set custom template as parameter of config argument', function() {
			var wrap = document.getElementById('test');

			new Calendar(wrap, {
				tmpl: ['<div class="customCalendarWrapper">',
							'<div class="calendar--header"></div>',
							'<div class="calendar--dates"></div>',
					   '</div>'].join('')
			});

			expect(document.querySelector('.customCalendarWrapper')).not.toBeNull();
			expect(document.querySelector('.calendar--dates')).not.toBeNull();
		});

		it('should provide opportunity to pass months names through config', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap, {
					monthNames: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
						'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
				}),
				monthWrapper = wrap.querySelector('.calendar--month-current');

			calendar.drawMonth(defaultMonth);
			expect(monthWrapper.textContent).toBe('февраль');
		});


		it('should generate calendar header (by default [su, mo, tu, we, th, fr, sa])', function() {
			var wrap = document.getElementById('test'),
				header;

			new Calendar(wrap);

			header = wrap.querySelector('.calendar--header');

			expect(header.querySelectorAll('.calendar--day').length).toBe(7);
			expect(header.children[0].textContent).toBe('su');
			expect(header.children[1].textContent).toBe('mo');
			expect(header.children[2].textContent).toBe('tu');
			expect(header.children[3].textContent).toBe('we');
			expect(header.children[4].textContent).toBe('th');
			expect(header.children[5].textContent).toBe('fr');
			expect(header.children[6].textContent).toBe('sa');
		});

		it('should add day of the week modifiers to header elements', function() {
			var wrap = document.getElementById('test'),
				header;

			new Calendar(wrap);

			header = wrap.querySelector('.calendar--header');
			expect(header.children[0].classList.contains('calendar--day-su')).toBe(true);
			expect(header.children[1].classList.contains('calendar--day-mo')).toBe(true);
			expect(header.children[2].classList.contains('calendar--day-tu')).toBe(true);
			expect(header.children[3].classList.contains('calendar--day-we')).toBe(true);
			expect(header.children[4].classList.contains('calendar--day-th')).toBe(true);
			expect(header.children[5].classList.contains('calendar--day-fr')).toBe(true);
			expect(header.children[6].classList.contains('calendar--day-sa')).toBe(true);

		});

		it('should correctly draw header if startOfWeekIndex provided through config argument', function() {
			var wrap = document.getElementById('test'),
				header;

			new Calendar(wrap, {
				startOfWeekIndex: 1
			});

			header = wrap.querySelector('.calendar--header');
			expect(header.children[0].classList.contains('calendar--day-mo')).toBe(true);
		});

		it('should provide opportunity to pass day of week names through config', function() {
			var wrap = document.getElementById('test'),
				header;

			new Calendar(wrap, {
				dayAbbrs: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
			});

			header = wrap.querySelector('.calendar--header');
			expect(header.children[3].textContent).toBe('ср');
		});

		it('should use global default config', function() {
			var wrap = document.getElementById('test'),
				header;

			Calendar.config.dayAbbrs = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

			new Calendar(wrap);

			header = wrap.querySelector('.calendar--header');
			expect(header.children[3].textContent).toBe('ср');
		});

		describe('E_CREATED', function() {
			var block,
				created;

			beforeEach(function() {
				block = document.getElementById('test');
				created = jasmine.createSpy('created');

				block.addEventListener(Calendar.E_CREATED, created);
				new Calendar(block);
			});
			afterEach(function() {
				block = created = null;
			});

			it('should fire once', function() {
				expect(created).toHaveBeenCalled();
				expect(created.calls.length).toBe(1);
			});

			it('should pass block and eventTarget to e.detail', function() {
				expect(created.mostRecentCall.args[0].detail.block).toBe(block);
				expect(created.mostRecentCall.args[0].detail.eventTarget).toBe(block);
			});
		});

	});

	describe('#drawMonth()', function() {
		it('should generate calendar', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				dates = wrap.querySelector('.calendar--dates');

			calendar.drawMonth(monthStartsOnSunday);

			expect(dates.querySelectorAll('.calendar--day').length).toBeGreaterThan(30, 'August 2010, total: 31, first: sunday, last: tuesday');
		});

		it('should complete calendar fragment with dates of previous and next month', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				dates = wrap.querySelector('.calendar--dates');

			calendar.drawMonth(defaultMonth);

			expect(dates.querySelectorAll('.calendar--day').length).toBe(35, 'February 2012, total: 29, first: wednesday, last: wednesday');
		});

		it('should add modifiers -prevMonth/-nextMonth on visible dates of previous/next months', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				dates = wrap.querySelector('.calendar--dates');

			calendar.drawMonth(defaultMonth);

			expect(dates.querySelectorAll('.calendar--day-prevMonth').length).toBe(3, 'February 2012, prevMonthVisible: 3');
			expect(dates.querySelectorAll('.calendar--day-nextMonth').length).toBe(3, 'February 2012, nextMonthVisible: 3');
		});

		it('should add day of the week modifiers to each date element', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				dates = wrap.querySelector('.calendar--dates'),
				date;

			calendar.drawMonth(defaultMonth);

			date = dates.querySelector('.calendar--day');
			expect(date.classList.contains('calendar--day-su')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-mo')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-tu')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-we')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-th')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-fr')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-sa')).toBe(true);
			date = DX.Dom.getNextSibling(date);
			expect(date.classList.contains('calendar--day-su')).toBe(true);
		});

		it('should write name of the month into .calendar--month-current element', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				monthName = wrap.querySelector('.calendar--month-current');

			calendar.drawMonth(defaultMonth);
			expect(monthName.textContent).toBe('february');

			calendar.drawMonth(monthStartsOnSunday);
			expect(monthName.textContent).toBe('august');

			calendar.drawMonth(monthEndsOnSaturday);
			expect(monthName.textContent).toBe('june');
		});

		it('should write year into .calendar--year element', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				year = wrap.querySelector('.calendar--year');

			calendar.drawMonth(defaultMonth);
			expect(year.textContent).toBe('2012');

			calendar.drawMonth(monthStartsOnSunday);
			expect(year.textContent).toBe('2010');
		});

		it('should work with templates without .calendar--year/.calendar--month-current elements', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap, {
					tmpl: ['<div class="customCalendarWrapper">',
						'<div class="calendar--header"></div>',
						'<div class="calendar--dates"></div>',
						'</div>'].join('')
				});

			expect(function() {
				calendar.drawMonth(defaultMonth);
			}).not.toThrow();
		});

		it('should correctly draw calendar if startOfWeekIndex provided through config argument', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap, {
					startOfWeekIndex: 1
				}),
				dates = wrap.querySelector('.calendar--dates'),
				firstDate;

			calendar.drawMonth(defaultMonth);
			firstDate = dates.querySelector('.calendar--day');

			expect(dates.querySelectorAll('.calendar--day').length).toBe(35);
			expect(firstDate.classList.contains('calendar--day-mo')).toBe(true);

			calendar.drawMonth(monthStartsOnSunday);
			expect(dates.querySelectorAll('.calendar--day').length).toBe(42);
		});

		it('should store dayObject as .model property of element .calendar--day', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				dates = wrap.querySelector('.calendar--dates');

			calendar.drawMonth(defaultMonth);

			expect(dates.querySelector('.calendar--day').model).toBeDefined();
		});

		it('should mark all dates of selected element with -currentMonth modifier', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.drawMonth(defaultMonth);

			expect(wrap.querySelectorAll('.calendar--day-currentMonth').length).toBe(29);
		});

		it('should mark first date of month with modifier -firstMonthDate', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.drawMonth(defaultMonth);

			expect(wrap.querySelectorAll('.calendar--day-firstMonthDate').length).toBe(2);
		});

		it('should mark last date of month with modifier -lastMonthDate', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.drawMonth(defaultMonth);

			expect(wrap.querySelectorAll('.calendar--day-lastMonthDate').length).toBe(2);
		});

		it('should not modify provided date', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.drawMonth(monthStartsOnSunday);
			expect(monthStartsOnSunday.getDate()).toBe(16);
		});
	});

	describe('#drawPrevMonth()', function() {
		it('should draw prev month', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				month = wrap.querySelector('.calendar--month-current');

			calendar.drawMonth(defaultMonth);

			calendar.drawPrevMonth();
			expect(month.textContent).toBe('january');
		});

		it('should switch year if current month is january', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				year = wrap.querySelector('.calendar--year');

			calendar.drawMonth(defaultMonth);

			calendar.drawPrevMonth();
			calendar.drawPrevMonth();
			expect(year.textContent).toBe('2011');
		});

		it('should accept date as argument', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				month = wrap.querySelector('.calendar--month-current');

			calendar.drawPrevMonth(defaultMonth);
			expect(month.textContent).toBe('january');
		});
	});

	describe('#drawNextMonth()', function() {
		it('should draw next month', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				month = wrap.querySelector('.calendar--month-current');

			calendar.drawMonth(defaultMonth);

			calendar.drawNextMonth();
			expect(month.textContent).toBe('march');
		});

		it('should switch year if current month is december', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				year = wrap.querySelector('.calendar--year');

			calendar.drawMonth(defaultMonth);

			calendar.drawNextMonth();
			expect(year.textContent).toBe('2012');
		});

		it('should accept date as argument', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				month = wrap.querySelector('.calendar--month-current');

			calendar.drawNextMonth(defaultMonth);
			expect(month.textContent).toBe('march');
		});
	});

	describe('#registerProcessor()', function() {
		it('should call registered processor function on every dateObject element', function() {
			var spyDateProcessor = jasmine.createSpy('fake processor'),
				wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.registerProcessor(spyDateProcessor);
			calendar.drawMonth(defaultMonth);

			expect(spyDateProcessor.calls.length).toBe(35);
		});

		it('should register today processor by default', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.drawMonth(new Date());

			expect(wrap.querySelectorAll('.calendar--day-today').length).toBe(1);
		});
	});

	describe('#deregisterProcessor()', function() {
		it('should provide opportunity to remove processor', function() {
			var spProcessor = jasmine.createSpy('fake processor'),
				wrap = document.getElementById('test'),
				calendar = new Calendar(wrap);

			calendar.registerProcessor(spProcessor);

			calendar.drawMonth(defaultMonth);
			expect(spProcessor.calls.length).toBe(35);

			calendar.deregisterProcessor(spProcessor);

			calendar.drawMonth(defaultMonth);
			expect(spProcessor.calls.length).toBe(35);
		});
	});

	describe('#getDate()', function() {
		it('should return first date of current month', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				date;

			calendar.drawMonth(defaultMonth);
			date = calendar.getDate();

			expect(date.getMonth()).toBe(1);
			expect(date.getDate()).toBe(1);
		});

		it('should return clone of date object', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				date;

			calendar.drawMonth(defaultMonth);

			date = calendar.getDate();
			date.setMonth(3);
			date = calendar.getDate();

			expect(date.getMonth()).toBe(1);
		});
	});

	describe('#update()', function() {
		it('should completely redraw all .calendar--day elements', function() {
			var wrap = document.getElementById('test'),
				calendar = new Calendar(wrap),
				beforeUpdate,
				afterUpdate;

			calendar.drawMonth(defaultMonth);

			beforeUpdate = wrap.querySelector('.calendar--dates .calendar--day:nth-child(15)');

			calendar.update();
			afterUpdate = wrap.querySelector('.calendar--dates .calendar--day:nth-child(15)');

			expect(beforeUpdate.textContent).toBe('12');
			expect(afterUpdate.textContent).toBe('12');
			expect(beforeUpdate).not.toBe(afterUpdate);
		});
	});

	describe('Constants', function() {
		it('should provide event names as public constant', function() {
			expect(Calendar.E_CREATED).toBe('calendar:created');
			expect(Calendar.E_DAY_SELECTED).toBe('calendar:dayselected');
		});
	});
});
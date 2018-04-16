function moment(){
		
	return new Date();
}

function TableVisualizerer() {
    var routeData = {};
    var currentPeriod = {};
    var previousPeriod = {};
    var isRing = true;
    var barMaxWidth = 50;
    var timeMap = [
        {
            class: "morning",
            name: "утро"
        },
        {
            class: "day",
            name: "день"
        },
        {
            class: "evening",
            name: "вечер"
        },
        {
            class: "night",
            name: "ночь"
        },
        {
            class: "all",
            name: "сутки"
        }
    ];

    function colorCounter() {
        var colors = ['#bdd7ee', '#92d050', '#ff9', '#2f75b5', '#f8cbad'];
        var currentCount = 0;

        return function () {
            var result = colors[currentCount];
            if (currentCount == colors.length - 1)
                currentCount = 0;
            else
                currentCount++;
            return result;
        };
    }

    this.showRings = function (flag) {
        isRing = flag;
    }; 

    this.setCurrentData = function (data) {
        routeData.current = data;
    };

    this.setCurrentPeriod = function (from, to) {
        currentPeriod.from = from;
        currentPeriod.to = to;
    };

    this.setPreviousData = function (data) {
        routeData.previous = data;
    };

    this.setPreviousPeriod = function (from, to) {
        previousPeriod.from = from;
        previousPeriod.to = to;
    };

    this.export = function () {
        var param = 'previousFrom=' + previousPeriod.from + '&previousTo=' + previousPeriod.to +
            '&currentFrom=' + currentPeriod.from + '&currentTo=' + currentPeriod.to;
        window.location.href = window.__root + 'monitor/monitor/roadscomparetoxls?' + param;
    };

    this.vizualizeTable = function () {
        if (routeData == null || routeData.current == null || routeData.previous == null) {
            return;
        }
         
            
             
        var getColor = colorCounter();
        var table = "<table>" + getThead();
       
        for (var i = 0; i < routeData.current.length; i++) {
            var current = routeData.current[i];
            if (current.isRing != isRing)
                continue;

            var previous = null;
            for (var j = 0; j < routeData.previous.length; j++) {
                if (routeData.previous[j].id == current.id) {
                    previous = routeData.previous[j];
                    break;
                }
            };
            if (!previous)
                continue;
            table += getTbody(current, previous, getColor);
        };
        table += "</table>";
        var $container = $(".comparationContent2");
        $container.empty();
        $container.append(table);
        return table;
    };

    function getThead() {
        return "<thead>" +
            "<tr>" +
            "<th rowspan='2' class='comparationContent__no-border '></th>" +
            "<th rowspan='2'>Время суток</th>" +
            "<th class='comparationContent__header-first-row comparationContent__double-width' colspan='2'>Предыдущий период</th>" +
            "<th class='comparationContent__header-first-row comparationContent__double-width' colspan='2'>Текущий период</th>" +
            "<th rowspan='2'>Время суток</th>" +
            "<th class='comparationContent__header-first-row' colspan='8'>Расхождение</th>" +
            "</tr>" +
            "<tr>" +
            "<th class='comparationContent__header-second-row comparationContent__single-width'>Будни</th>" +
            "<th class='comparationContent__header-second-row comparationContent__single-width comparationContent__right-double-border'>Выходные</th>" +
            "<th class='comparationContent__header-second-row comparationContent__single-width'>Будни</th>" +
            "<th class='comparationContent__header-second-row comparationContent__single-width'>Выходные</th>" +
            "<th class='comparationContent__header-second-row comparationContent__single-width' colspan='3'>Будни</th>" +
            "<th class='comparationContent__header-second-row comparationContent__half-width'>%</th>" +
            "<th class='comparationContent__header-second-row comparationContent__single-width' colspan='3'>Выходные</th>" +
            "<th class='comparationContent__header-second-row comparationContent__half-width'>%</th>" +
            "</tr>" +
            "</thead >";
    };

    function getRow(current, previous, time) {

        var workingDayBarSizePlus = 0;
        var workingDayBarSizeMinus = 0;
        var weekendBarSizePlus = 0;
        var weekendBarSizeMinus = 0;

        var workingDayDiff = current.workingDaySpeed[time.class] - previous.workingDaySpeed[time.class];
        var weekendDiff = current.weekendSpeed[time.class] - previous.weekendSpeed[time.class];

        var workingDayPercent = (workingDayDiff == 0 || previous.workingDaySpeed[time.class] == 0) ?
            0 : Math.round(workingDayDiff / previous.workingDaySpeed[time.class] * 1000) / 10;
        var weekendPercent = (weekendDiff == 0 || previous.weekendSpeed[time.class] == 0) ?
            0 : Math.round(weekendDiff / previous.weekendSpeed[time.class] * 1000) / 10;

        var workingDayBarSize = barMaxWidth * workingDayPercent / 100;
        if (workingDayBarSize > 0)
            workingDayBarSizePlus = workingDayBarSize;
        else
            workingDayBarSizeMinus = Math.abs(workingDayBarSize);

        var weekendBarSize = barMaxWidth * weekendPercent / 100;
        if (weekendBarSize > 0)
            weekendBarSizePlus = weekendBarSize;
        else
            weekendBarSizeMinus = Math.abs(weekendBarSize);

        return "<tr class='" + time.class + "'>" +
            "<td class='comparationContent__single-borger'>" + time.name + "</td>" +
            "<td class='previous-weekdays comparationContent__single-borger'>" + previous.workingDaySpeed[time.class] + "</td>" +
            "<td class='previous-weekend comparationContent__right-double-border'>" + previous.weekendSpeed[time.class] + "</td>" +
            "<td class='current-weekdays comparationContent__single-borger'>" + current.workingDaySpeed[time.class] + "</td>" +
            "<td class='current-weekend comparationContent__single-borger'>" + current.weekendSpeed[time.class] + "</td>" +
            "<td class='comparationContent__right-double-border'>" + time.name + "</td>" +
            "<td class='comparationContent__dif-bar-container comparationContent__no-border'><div><div class='comparationContent__dif-bar-minus ' title = '" + workingDayPercent + "%' style='width:" + workingDayBarSizeMinus + "px'>&nbsp</div></div></td>" +
            "<td class='comparationContent__dif-bar-container comparationContent__no-border'><div><div class='comparationContent__dif-bar-plus' title = '" + workingDayPercent + "%' style='width:" + workingDayBarSizePlus + "px'>&nbsp</div></div></td>" +
            "<td class='dif-weekdays-value comparationContent__no-border comparationContent__half-width'>" + workingDayDiff + "</td>" +
            "<td class='dif-weekdays-procent comparationContent__no-border comparationContent__half-width'>" + workingDayPercent + "</td>" +
            "<td class='comparationContent__dif-bar-container comparationContent__no-border'><div><div class='comparationContent__dif-bar-minus ' title = '" + weekendPercent + "%' style='width:" + weekendBarSizeMinus + "px'>&nbsp</div></div></td>" +
            "<td class='comparationContent__dif-bar-container comparationContent__no-border'><div><div class='comparationContent__dif-bar-plus' title = '" + weekendPercent + "%' style='width:" + weekendBarSizePlus + "px'>&nbsp</div></div></td>" +
            "<td class='dif-weekend-value comparationContent__no-border comparationContent__half-width'>" + weekendDiff + "</td>" +
            "<td class='dif-weekend-procent comparationContent__no-border comparationContent__half-width'>" + weekendPercent + "</td>" +
            "</tr>";
    };

    function getRbodyRouteSide(current, previous, name) {
        var pattern = "<tr>" +
            "<th colspan= '14' class='comparationContent__sub-title inner-side'>" + name + "</th>" +
            "</tr>"
        timeMap.forEach(function (time) {
            pattern += getRow(current, previous, time);
        });
        return pattern;
    };

    function getTbody(current, previous, getColor) {
        var directName;
        var reverseName;
        if (current.isRing) {
            directName = current.name + " (внутренняя сторона)";
            reverseName = current.name + " (внешняя сторона)";
        }
        else {
            directName = current.name + " (в центр)";
            reverseName = current.name + " (из центра)";
        };
        var pattern = "<tbody>" +
            "<tr>" +
            "<th class='comparationContent__vertical-text' rowspan='13' style='background-color: " + getColor() +"'>" +
            "<div>" + current.name + "</div>" +
            "</th>" +
            "</tr>";
        pattern += getRbodyRouteSide(current.direct, previous.direct, directName);
        pattern += getRbodyRouteSide(current.reverse, previous.reverse, reverseName);
        pattern += "</tbody>";
        return pattern;
    };
};

			
$(document).ready(function () {
    var vizualizere = new TableVisualizerer();
    var Pickers = $('input.datepicker-here');
    var start;
    var end;
    var starter1;
    var starter2;
    $.each(Pickers, function () {
        var idinter = $(this).attr('name');
        if (idinter == "period_prev_hidden") {
            start = moment();//(moment().subtract('month', 1).startOf('month')).format('DD.MM.YYYY');
            end = moment();//(moment().subtract('month', 1).endOf('month')).format('DD.MM.YYYY');
            $('input[name="period_prev_hidden"]').val(start + '-' + end);
            
        } else {
            start = moment();//(moment().startOf('month')).format('DD.MM.YYYY');
            end = moment();//(moment().endOf('month')).format('DD.MM.YYYY');
            $('input[name="period_current_hidden"]').val(start + '-' + end);
        }
        starter1 = $('input[name="period_prev"]').val();
        starter2 = $('input[name="period_current"]').val();
        SendRequest(idinter);
    });
    var pseudoFields = $('.pseudo');
    $.each(pseudoFields, function () {
        $(this).val($(this).next('input').val());

    }); 
    var maxdate = moment();
 
     
    $('.datepicker-here[name="period_prev_hidden"]').datepicker({
        startDate:  starter1,
        maxDate: new Date(maxdate),
        range: true,
        multipleDatesSeparator: "-",
        onShow: function (dp, el) {

            //    dp.el.val = $(dp.el).prev('input').val();
        },
        onHide: function (dp,elex) {
                var idinter = $(dp.el).attr('name');
                SendRequest(idinter);
        }

    });
    $('.datepicker-here[name="period_current_hidden"]').datepicker({
        startDate:  starter2,
        maxDate: new Date(maxdate),
        range: true,
        multipleDatesSeparator: "-",
        onShow: function (dp, el) {

            //    dp.el.val = $(dp.el).prev('input').val();
        },
        onHide: function (dp, elex) {
            var idinter = $(dp.el).attr('name');
            SendRequest(idinter);
        }
    });
 
   
    


    function SendRequest(idint) {
            sendData(idint);
    }
    function sendData(identif) {
        var curperiod = $('input[name="' + identif + '"]').val().split('-');
        curperiod[0] = curperiod[0].split('.');
        curperiod[1] = curperiod[1].split('.');
        var formatted1 = ''+curperiod[0][2] + '-' + curperiod[0][1] + '-' + curperiod[0][0];
        var formatted2 = curperiod[1][2] + '-' + curperiod[1][1] + '-' + curperiod[1][0];

        var from_dat = formatted1;
        var to_dat = formatted2;
       
        var data = { from: from_dat, to: to_dat }

        $.ajax({
            url: window.__root + 'api/monitor/routestatlist',
            type: "GET",
            dataType: 'json',
            data: data,
            beforeSend: function () { $('.date-container__loading').show(300); },
            success: function (response) {
                $('.date-container__loading').hide();
                $('.date-container__loading').css('display', 'none');
                var stratPeriod = from_dat;
                var endPeriod =  to_dat;   
                switch (identif) {
                    case 'period_prev_hidden':
                        vizualizere.setPreviousData(response);
                        vizualizere.setPreviousPeriod(stratPeriod, endPeriod);
 
                        break;
                    case 'period_current_hidden':
                        vizualizere.setCurrentData(response);
                        vizualizere.setCurrentPeriod(stratPeriod, endPeriod);
                        break;
                }
                 
              
                vizualizere.vizualizeTable();
     
            },
            error: function (response) {
                console.log(response)
            }
        });
    }

  
    
    $('input.pseudo').on('click', function () {
            
             $.each(Pickers, function () {
                $(this).datepicker().data('datepicker').show();
               });
        });


				
                $('body').on('click', function (ev) {
                    var pseudoFields = $('.pseudo');
                      $.each(Pickers, function () {
                        if (!$(this).val()) {
                            $(this).val($(this).prev('input').val());
                        }
                        });
                        $.each(pseudoFields, function () {
                            $(this).val($(this).next('input').val());

                        });
                       
        			});
			
			 
			 
				$('body').on('click','.datepicker-here', function(ev){
					
					if(ev.target!=$('.datepicker-here') || ev.target==$('.datepicker--cell')){
							  
						$.each(datePickers, function(){ 
							var curPicker = $(this).datepicker().data('datepicker');
							curPicker.show();
							
						});
						
					}
					 
				});
			

    $('#btnRings_e').on('click', function (event) {
        if (!checkBtn($(event.target)))
            return;
        vizualizere.showRings(true);
        vizualizere.vizualizeTable();
    });
    $('#btnRadials_e').on('click', function () {
        if (!checkBtn($(event.target)))
            return;
        vizualizere.showRings(false);
        vizualizere.vizualizeTable();
    });
    function checkBtn($btn) {
        if ($(event.target).hasClass('active'))
            return false;
        $('.btn').removeClass('active');
        $(event.target).addClass('active')
        return true;
    }
    $('#btnExport_e').on('click', function () {
        vizualizere.export();
    });		
					 
		}); 
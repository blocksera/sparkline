// Uses CommonJS, AMD or browser globals to create a jQuery plugin.
(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define(["jquery", "depp"], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        factory(require('jquery'), require('johnnydepp'));
    } else {
        factory(jQuery, depp);
    }
})(function($, depp) {
    'use strict';

    if (!depp.isDefined('chartjs')) {
        depp.define({'chartjs': ['https://cdn.jsdelivr.net/npm/chart.js@3.6.0/dist/chart.min.js']});
    }

    $.fn.sparkline = function(options) {

        var self = this,
            $self = $(this),
            ctx = self[0],
            points = [],
            defaults = {
                width: $self.data('width') || '100%',
                height: $self.data('height') || 50,
                padding: $self.data('padding') || 0
            };

        options = $.extend({}, defaults, options);

        var init = function() {
            depp.require(['chartjs'], function() {
                _revert();
                _getPoints();
                _setContainerSize();
                _drawChart();
            });
        }

        var _revert = function() {
            // Destroy exiting Chart Instance to reuse <canvas> element
            let chartStatus = Chart.getChart(ctx); // <canvas> id
            if (chartStatus != undefined) {
                chartStatus.destroy();
            }
        }

        var _getPoints = function() {
            points = $self.data('points').split(',');
            var min = Math.min.apply(Math, points);
            var max = Math.max.apply(Math, points);
            points = _getPercents(points, min, max);
            if (options.padding) {
                points = points.map(n => n + options.padding);
            }
        }

        var _getPercents = function(arr, min, max) {
            return arr.map(function(value) { return 100 * (value - min) / (max - min); });
        }

        var _setContainerSize = function() {
            $self.css('width', options.width);
            $self.css('height', options.height);
        }

        var _drawChart = function() {

            var color = points[0] > points.at(-1) ? '234,57,67' : '22,199,132';

            var background = ctx.getContext('2d').createLinearGradient(0, 0, 0, options.height);
            background.addColorStop(0, 'rgba(' + color + ',0.5)');
            background.addColorStop(1, 'rgba(' + color + ',0)');

            var chart = new Chart(ctx.getContext("2d"), {
                type: 'line',
                data: {
                    labels: points,
                    datasets: [{
                        data: points,
                        borderColor: 'rgb(' + color + ')',
                        borderWidth: 2,
                        backgroundColor: background,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHitRadius: 50,
                        pointHoverBorderWidth: 3,
                        pointHoverRadius: 6,
                        pointHoverBorderColor: 'white',
                        pointHoverBackgroundColor: 'rgb(' + color + ')',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: false,
                            beginAtZero: options.padding > 0 ? true : false
                        }
                    },
                    layout: {
                        padding: {
                            top: 1 // Prevent chart cutting at top
                        }
                    }
                }
            });

        }

        init();

    }

});
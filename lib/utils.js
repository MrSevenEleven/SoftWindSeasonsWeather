const BACKGROUNDIMAGE_URL='../../images/bg';
const $={
    getChartOption(data) {
        if (!data) {
            data = [
                [],
                []
            ]
        }
        let option = {
            color: ["#FFB74D", "#4FC3F7"],
            // legend: {
            //     show: false
            // },
            grid: {
                containLabel: false,
                left: 26,
                right: 26,
                top: 30,
                bottom: 30
            },
            // tooltip: {
            //     show: false,
            //     trigger: 'axis'
            // },
            xAxis: {
                show: false,
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                // show: false
            },
            yAxis: {
                show: false,
                x: 'center',
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
                // show: false
            },
            series: [{
                name: 'A',
                type: 'line',
                smooth: true,
                label: {
                    show: true,
                    color: '#fff',
                    formatter: "{c}°"
                },
                data: data[0]
            }, {
                name: 'B',
                type: 'line',
                smooth: true,
                label: {
                    show: true,
                    color: '#fff',
                    formatter: "{c}°"
                },
                data: data[1]
            }]
        };
        return option;
    },
    isNight(now, sunrise, sunset) {
        sunrise = parseInt(sunrise) + 1;
        sunset = parseInt(sunset);
        let isNight = false
        if (now > sunset) {
            isNight = true
        } else if (now < sunrise) {
            isNight = true
        }
        return isNight
    },
    getIconNameByCode(code, isNight) {
    const nightMap = {
        '100': 'qingye',
        '200': 'qingye',
        '201': 'qingye',
        '202': 'qingye',
        '203': 'qingye',
        '204': 'qingye',
        '101': 'duoyunye',
        '102': 'duoyunye',
        '103': 'duoyunye',
        '300': 'zhenyuye',
        '301': 'zhenyuye',
        '302': 'zhenyuye',
        '303': 'zhenyuye',
        '304': 'zhenyuye',
        '305': 'zhenyuye',
        '306': 'zhenyuye',
        '307': 'zhenyuye',
        '308': 'zhenyuye',
        '309': 'zhenyuye',
        '310': 'zhenyuye',
        '311': 'zhenyuye',
        '312': 'zhenyuye',
        '313': 'zhenyuye',
        '314': 'zhenyuye',
        '315': 'zhenyuye',
        '316': 'zhenyuye',
        '399': 'zhenyuye',
        '317': 'zhenyuye',
        '318': 'zhenyuye',
        '400': 'zhenxueye',
        '401': 'zhenxueye',
        '402': 'zhenxueye',
        '403': 'zhenxueye',
        '404': 'zhenxueye',
        '405': 'zhenxueye',
        '406': 'zhenxueye',
        '407': 'zhenxueye',
        '408': 'zhenxueye',
        '409': 'zhenxueye',
        '410': 'zhenxueye',
        '499': 'zhenxueye'
    }
    const dayMap = {
        '100': 'qingbai',
        '101': 'duoyunbai',
        '102': 'duoyunbai',
        '103': 'duoyunbai',
        '104': 'yin',
        '201': 'qingye',
        '202': 'qingye',
        '203': 'qingye',
        '204': 'qingye',
        '205': 'fengli',
        '206': 'fengli',
        '207': 'fengli',
        '208': 'fengli',
        '209': 'yin',
        '210': 'yin',
        '211': 'yin',
        '212': 'yin',
        '213': 'yin',

        '300': 'zhenyubai',
        '301': 'zhenyubai',
        '302': 'leizhenyu',
        '303': 'leizhenyu',
        '304': 'leizhenyuzhuanbingbao',
        '305': 'xiaoyu',
        '306': 'zhongyu',
        '307': 'dayu',
        '308': 'tedabaoyu',
        '309': 'xiaoyu',
        '310': 'baoyu',
        '311': 'dabaoyu',
        '312': 'tedabaoyu',
        '313': 'dongyu',
        '314': 'xiaoyu',
        '315': 'zhongyu',
        '316': 'dayu',
        '317': 'baoyu',
        '318': 'dabaoyu',
        '399': 'xiaoyu',

        '400': 'xiaoxue',
        '401': 'zhongxue',
        '402': 'daxue',
        '403': 'baoxue',
        '404': 'yujiaxue',
        '405': 'yujiaxue',
        '406': 'yujiaxue',
        '407': 'zhenxuebai',
        '408': 'xiaoxue',
        '409': 'zhongxue',
        '410': 'daxue',
        '499': 'xiaoxue',

        '500': 'wu',
        '501': 'wu',
        '502': 'wumaibai',
        '503': 'yangsha',
        '504': 'yangsha',
        '507': 'shachenbao',
        '508': 'qiangshachenbao',
        '509': 'wu',
        '510': 'wu',
        '511': 'wumaibai',
        '512': 'wumaibai',
        '513': 'wumaibai',
        '514': 'wu',
        '515': 'wu',

        '900': 'qingbai',
        '901': 'qingbai',
        '902': 'yin'
    }
    if (isNight && nightMap[code]) {
        return nightMap[code]
    }
    return dayMap[code] ? dayMap[code] : 'yin'
},
    getBackgroundColor(name, night = 'day') {
        name = `${night}_${name}`
        const map = {
            day_cloud: '62aadc',
            night_cloud: '27446f',
            day_rain: '2f4484',
            night_rain: '284469',
            day_thunder: '3a4482',
            night_thunder: '2a2b5a',
            day_clear: '57b9e2',
            night_clear: '173868',
            day_overcast: '5c7a93',
            night_overcast: '22364d',
            day_snow: '95d1ed',
            night_snow: '7a98bc',
            night_smog: '494d57'
        };
        let color = map[name] ? map[name] : '27446f';
        return `#${color}`
    },
    getBackgroundImage(name, night = 'day') {
        return BACKGROUNDIMAGE_URL + '/' + `${night}/${name}.jpg`;
    },
    getWeatherName(code) {
        code = parseInt(code)
        let result = 'rain'
        if (code === 100 || (code >= 200 && code <= 204)) {
            result = 'clear'
        } else if (code > 100 && code <= 103) {
            result = 'cloud'
        } else if (code === 104 || (code >= 205 && code <= 208)) {
            result = 'overcast'
        } else if (code >= 302 && code <= 304) {
            result = 'thunder'
        } else if (code >= 400 && code < 500) {
            result = 'snow'
        } else if ((code >= 511 && code <= 513) || code === 502) {
            //霾
            result = 'smog'
        } else if (code === 501 || (code >= 514 && code <= 515) || (code >= 509 && code <= 510)) {
            // 这个是雾气
            result = 'smog'
        } else if (code >= 503 && code < 508) {
            // 扬沙
            result = 'smog'
        } else if (code >= 900) {
            result = 'clear'
        }
        return result
    },
    getEffectSettings(code) {
        code = parseInt(code)
        let result = false;

        if ((code >= 300 && code <= 304) || code === 309 || code === 313 || code == 399 || code === 406 || code === 404) {
            result = {
                name: 'rain',
                amount: 100
            }
        } else if (code === 499 || code === 405) {
            result = {
                name: 'snow',
                amount: 100
            }
        } else if (code >= 305 && code <= 312) {
            let amount = 100 + (code - 305) * 20;
            result = {
                name: 'rain',
                amount: amount
            }
        } else if (code >= 314 && code <= 318) {
            let amount = 100 + (code - 314) * 20;
            result = {
                name: 'rain',
                amount: amount
            }
        } else if (code >= 400 && code <= 403) {
            let amount = 100 + (code - 400) * 20;
            result = {
                name: 'snow',
                amount: amount
            }
        } else if (code >= 407 && code <= 410) {
            let amount = 100 + (code - 407) * 20;
            result = {
                name: 'snow',
                amount: amount
            }
        }
        return result
    },
    setLifestyle(data) {
    let arr = []
    const map = {
        cw: {
            icon: 'xichezhishu',
            name: '洗车'
        },
        sport: {
            icon: 'yundongzhishu',
            name: '运动'
        },
        flu: {
            icon: 'ganmao',
            name: '感冒'
        },
        uv: {
            icon: 'ziwaixian',
            name: '紫外线强度'
        },
        drsg: {
            icon: 'liangshai',
            name: '穿衣'
        },
        air: {
            icon: 'beikouzhao',
            name: '污染扩散'
        },

        trav: {
            icon: 'fangshai',
            name: '旅游'
        },
        comf: {
            icon: 'guominzhishu',
            name: '舒适度'
        }
    }
    data.forEach((v) => {
        let t = map[v.type]
        // console.log(v.type)
        arr.push({
            name: t.name,
            icon: t.icon,
            info: v.brf,
            detail: v.txt
        })
    })
    return arr
},
    getOneWord() {
    const list = [
        '生活是天气，有阴有晴有风雨',
        '心怀感恩，幸福常在',
        '心累的时候，换个心情看世界',
        '想获得人生的金子，就必须淘尽生活的沙烁',
        '因为有明天，今天永远只是起跑线',
        '只要心情是晴朗的，人生就没有雨天',
        '有你的城市下雨也美丽',
        '雨划过我窗前，玻璃也在流眼泪',
        '天空澄碧，纤云不染',
        '人生，不要被安逸所控制',
        '在受伤的时候，也能浅浅的微笑',
        '不抱怨过去，不迷茫未来，只感恩现在',
        '生活向前，你向阳光',
        '在阳光中我学会欢笑，在阴云中我学会坚强'
    ]
    let index = Math.floor(Math.random() * list.length)
    return list[index] ? list[index] : list[0]
},
};
export {$};

// const formatTime = date => {
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1
//     const day = date.getDate()
//     const hour = date.getHours()
//     const minute = date.getMinutes()
//     const second = date.getSeconds()
//
//     return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }


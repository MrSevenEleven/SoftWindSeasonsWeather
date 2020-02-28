const KEY = '5995f795d32640bbafcffa3f88198b51';//和风天气认证
const QQ_MAP_KEY = "6YBBZ-WSZ66-7CSSS-E4QX5-EJAJK-QCFEN";//腾讯地图认证

const getMood = function (province, city, nation) {
    return new Promise((resolve,reject)=>{
        wx.request({
            url: 'https://wis.qq.com/weather/common',
            data: {
                source: 'wxa',
                weather_type: 'tips',
                province,
                city,
                nation
            },
            success: res => {
                let result = (res.data || {}).data;
                if (result && result.tips) {
                    let tips = result.tips.observe;
                    let index = Math.floor(Math.random() * Object.keys(tips).length);
                    resolve(tips[index]) ;
                }
            }
        })
    });

}
const getHFWeather = (lat, lon, curTime) => {
    const Url = "https://free-api.heweather.net/s6/weather/" + curTime;
    return new Promise((resolve, reject) => {
        wx.request({
            url: Url,
            data: {
                location: `${lon},${lat}`,
                key: KEY,
            },
            success: (res) => {
                resolve(res);
            },
            fail: (e) => {
                reject(e)
            }
        })
    })

}
const getHFAir = (city, curTime) => {
    const Url = "https://free-api.heweather.net/s6/air/" + curTime;
    return new Promise((resolve, reject) => {
        wx.request({
            url: Url,
            data: {
                location: city,
                key: KEY,
            },
            success: (res) => {
                resolve(res);
            },
            fail: (e) => {
                reject(e)
            }
        })
    })

}
const transGcjLocationToName = (lat, lon) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/',
            data: {
                location: `${lat},${lon}`,
                key: QQ_MAP_KEY,
                get_poi: 0
            },
            success: (res) => {
                resolve(res);
            },
            fail: (e) => {
                reject(e);
            }
        })
    });

};
export {
    getMood,
    getHFWeather,
    getHFAir,
    transGcjLocationToName
}

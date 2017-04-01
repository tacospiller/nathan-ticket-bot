module.exports = {
    
    parseDate: (str) => {
        const m1 = str.match('([0-9]{1,2})\/([0-9]{1,2})');
        if (m1 && m1.length >= 3) {
            return {
                month: parseInt(m1[1]),
                day: parseInt(m1[2]),
            };
        }

        const m2 = str.match('([0-9]{1,2})월[ ]?([0-9]{1,2})일');
        if (m2 && m2.length >= 3) {
            return {
                month: parseInt(m2[1]),
                day: parseInt(m2[2]),
            };
        }

        if (str.includes('오늘')) {
            const d = new Date();
            return {
                month: d.getMonth() + 1,
                day: d.getDate()
            };
        }

        if (str.includes('내일')) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return {
                month: d.getMonth() + 1,
                day: d.getDate()
            }
        }
    },

    formatShow: (show) => {
        if (show.date) {
            return [show.date.month, '월 ', show.date.day, '일 ', show.showName].join('');
        }
        else return show.showName.join(', ');
    }
}
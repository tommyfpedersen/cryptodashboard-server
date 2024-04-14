const { convertToAxisString } = require("../../../utils/stringUtil");
const { getBlock } = require("../api/api");

function isBlockInVolumeArray(volumeInDollarsArray, block, currency, type) {
    let result = false;
    volumeInDollarsArray.forEach((item) => {
        if (item.height === block) {
            if (item.currencyid === currency && item.type === type) {
                result = true;
            }
        }
    })
    return result;
}

async function calculateCurrencyVolume(volumeArray, miningInfoBlocks) {
    let result = {};
    let volumeInDollars24Hours = 0;
    let volumeInDollars24HoursArray = [];
    let volumeInDollars24HoursArrayYAxis = [];
    let volumeInDollars7Days = 0;
    let volumeInDollars7DaysArray = [];
    let volumeInDollars7DaysArrayYAxis = [];
    let volumeInDollars30Days = 0;
    let volumeInDollars30DaysArray = [];
    let volumeInDollars30DaysArrayYAxis = [];

    let getblock = await getBlock(miningInfoBlocks);

    //   // 24 hour
    const blockInterval24H = 60;
    let snapShootInterval24H = 0;
    let volumeInDollarsCounter24H = 0;
    let counter = -1;
    let totalVol = 0;

    volumeArray
        .sort((a, b) => b.height - a.height)
        .filter((item) => {
            return item.height > getblock.height - 1440;
        })
        .forEach((elm) => {
            if (elm.height > getblock.height - 1440) {
                if (elm.height < (getblock.height - snapShootInterval24H)) {
                    snapShootInterval24H = snapShootInterval24H + blockInterval24H;
                    volumeInDollars24HoursArray.push({ price: volumeInDollarsCounter24H, label: counter + " hours ago" })

                    volumeInDollarsCounter24H = 0;
                    counter++;
                }
                volumeInDollarsCounter24H += elm.dollars;
                volumeInDollars24Hours = volumeInDollars24Hours + elm.dollars;
            }
        })
    volumeInDollars24HoursArray.reverse();

    let volumeInDollars24HoursArrayMax = Math.max(...volumeInDollars24HoursArray.map(o => o.price));
    volumeInDollars24HoursArrayYAxis.push({ value: convertToAxisString(volumeInDollars24HoursArrayMax) });
    volumeInDollars24HoursArrayYAxis.push({ value: convertToAxisString(volumeInDollars24HoursArrayMax / 2) });
    volumeInDollars24HoursArrayYAxis.push({ value: 0 });

    volumeInDollars24HoursArray.forEach((item) => {
        item.barPCT = (item.price / volumeInDollars24HoursArrayMax) * 100;
        item.price = convertToAxisString(item.price)
    })

    volumeInDollars24Hours = (Math.round(volumeInDollars24Hours * 100) / 100).toLocaleString();

    result.volumeInDollars24Hours = volumeInDollars24Hours;
    result.volumeInDollars24HoursArray = volumeInDollars24HoursArray;
    result.volumeInDollars24HoursArrayYAxis = volumeInDollars24HoursArrayYAxis;

    // 7 days
    const blockInterval7D = 1440;
    let snapShootInterval7D = 0;
    let volumeInDollarsCounter7D = 0;
    counter = -1;
    totalVol = 0;

    volumeArray
        .sort((a, b) => b.height - a.height)
        .filter((item) => {
            return item.height > getblock.height - 1440 * 8;
        })
        .forEach((elm) => {

            if (elm.height > getblock.height - 1440 * 8) {
                if (elm.height < (getblock.height - snapShootInterval7D)) {
                    snapShootInterval7D = snapShootInterval7D + blockInterval7D;
                    volumeInDollars7DaysArray.push({ price: volumeInDollarsCounter7D, label: counter + " days ago" })

                    volumeInDollarsCounter7D = 0;
                    counter++;
                }
                volumeInDollarsCounter7D += elm.dollars;
                volumeInDollars7Days = volumeInDollars7Days + elm.dollars;
            }
        })
    volumeInDollars7DaysArray.reverse();

    let volumeInDollars7DaysArrayMax = Math.max(...volumeInDollars7DaysArray.map(o => o.price));
    volumeInDollars7DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars7DaysArrayMax) });
    volumeInDollars7DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars7DaysArrayMax / 2) });
    volumeInDollars7DaysArrayYAxis.push({ value: 0 });

    volumeInDollars7DaysArray.forEach((item) => {
        item.barPCT = (item.price / volumeInDollars7DaysArrayMax) * 100;
        item.price = convertToAxisString(item.price)
    })

    volumeInDollars7Days = (Math.round(volumeInDollars7Days * 100) / 100).toLocaleString();

    result.volumeInDollars7Days = volumeInDollars7Days;
    result.volumeInDollars7DaysArray = volumeInDollars7DaysArray;
    result.volumeInDollars7DaysArrayYAxis = volumeInDollars7DaysArrayYAxis;

    //   // 30 days
    const blockInterval30D = 1440;
    let snapShootInterval30D = 0;
    let volumeInDollarsCounter30D = 0;
    counter = -1;
    totalVol = 0;

    volumeArray
        .sort((a, b) => b.height - a.height)
        .filter((item) => {
            return item.height > getblock.height - 1440 * 31;
        })
        .forEach((elm) => {
            if (elm.height > getblock.height - 1440 * 31) {
                if (elm.height < (getblock.height - snapShootInterval30D)) {
                    snapShootInterval30D = snapShootInterval30D + blockInterval30D;
                    volumeInDollars30DaysArray.push({ price: volumeInDollarsCounter30D, label: counter + " days ago" })

                    volumeInDollarsCounter30D = 0;
                    counter++;
                }
               
                if(!isNaN(elm.dollars)){
                    volumeInDollarsCounter30D += elm.dollars;
                    volumeInDollars30Days = volumeInDollars30Days + elm.dollars;
                }
               
            }
        })
    volumeInDollars30DaysArray.reverse();

    let volumeInDollars30DaysArrayMax = Math.max(...volumeInDollars30DaysArray.map(o => o.price));
    volumeInDollars30DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars30DaysArrayMax) });
    volumeInDollars30DaysArrayYAxis.push({ value: convertToAxisString(volumeInDollars30DaysArrayMax / 2) });
    volumeInDollars30DaysArrayYAxis.push({ value: 0 });

    volumeInDollars30DaysArray.forEach((item) => {
        item.barPCT = (item.price / volumeInDollars30DaysArrayMax) * 100;
        item.price = convertToAxisString(item.price)
    })

    volumeInDollars30Days = (Math.round(volumeInDollars30Days * 100) / 100).toLocaleString();

    result.volumeInDollars30Days = volumeInDollars30Days;
    result.volumeInDollars30DaysArray = volumeInDollars30DaysArray;
    result.volumeInDollars30DaysArrayYAxis = volumeInDollars30DaysArrayYAxis;

    return result;
}

module.exports = {isBlockInVolumeArray, calculateCurrencyVolume }
import { getNodeStatus, getBlockAndFeePoolRewards, getAddressBalance, calculateStakingRewards, calculateMiningRewards, getCurrencyVolume, getCurrencyReserve, getMarketCapStats, getVerusPriceList, getCurrencyPriceArray } from '../verus/verus.js';
import { getVarrrNodeStatus, getVarrrBlockAndFeePoolRewards, getVarrrAddressBalance, calculateVarrrStakingRewards, calculateVarrrMiningRewards, getVarrrCurrencyVolume, getVarrrCurrencyReserve, getVarrrPriceList } from '../varrr/varrr.js';
import { getVdexNodeStatus, getVdexBlockAndFeePoolRewards, getVdexAddressBalance, calculateVdexStakingRewards, calculateVdexMiningRewards, getVdexCurrencyVolume, getVdexCurrencyReserve, getVdexPriceList } from '../vdex/vdex.js';
import { getCoingeckoPrice } from '../coingecko/coingecko.js';
import { getThreeFoldNodeArray } from '../threefold/threefold.js';
import client from '../../redisClient.js';



export async function getBlockchainData() {

    /* Clear fetch status */
    client.set("fetchingerror", JSON.stringify(false));


    /* RenderData def*/
    let mainRenderData = {};
    let priceArray = [];
    let vrscReserveArray = [];
    let vrsc24HVolumeArray = [];
    let vrscReserveTotal = 0;
    let vrsc24HVolumeTotal = 0;

    /* Get price from coingecko */
    let coingeckoPriceArray = await getCoingeckoPrice();
    let bitcoinPriceItem = coingeckoPriceArray.find(item => item.name === "bitcoin");
    let bitcoinPrice = bitcoinPriceItem?.price.toLocaleString() || "0";
    let ethereumPriceItem = coingeckoPriceArray.find(item => item.name === "ethereum");

    priceArray = [...coingeckoPriceArray];

    /* Get 24h volume from coingecko*/
    let vrscCoingeckoVolume = "0";
    if (coingeckoPriceArray.find(item => item.name === "verus-coin") !== undefined) {
        vrscCoingeckoVolume = coingeckoPriceArray.find(item => item.name === "verus-coin").totalVolume;
    }


    ////

    /* Verus */
    let vrscRenderData = {};
    let currencyReserveBridge = {};
    const vrscNodeStatus = await getNodeStatus();

    if (vrscNodeStatus.online === true) {
        /* Get address balance */
        const verusAddressBalance = await getAddressBalance("");

        /* Get block and fee pool rewards */
        const blockandfeepoolrewards = await getBlockAndFeePoolRewards();
        const currentBlock = blockandfeepoolrewards.block;

        /* Get bridge.veth volume and reserve info */
        const vrscVolume24Hours = await getCurrencyVolume("bridge.veth", currentBlock - 1440, currentBlock, 60, "DAI.vETH");
        const vrscVolume7Days = await getCurrencyVolume("bridge.veth", currentBlock - 1440 * 7, currentBlock, 1440, "DAI.vETH");
        const vrscVolume30Days = await getCurrencyVolume("bridge.veth", currentBlock - 1440 * 30, currentBlock, 1440, "DAI.vETH");

        currencyReserveBridge = await getCurrencyReserve("bridge.veth", coingeckoPriceArray);

        /* Get Coinsupply - marketcap */
        const coinSupply = await getMarketCapStats(currentBlock, currencyReserveBridge.vrscBridgePrice)

        /* Get verus price list*/
        const vrscPriceList = await getVerusPriceList(currencyReserveBridge.vrscBridgePrice)

        /* Calculate staking rewards */
        const stakingRewards = await calculateStakingRewards(coinSupply.totalSupply, blockandfeepoolrewards.stakingsupply, 100, currencyReserveBridge.vrscBridgePrice);

        /* Calculate mining rewards */
        const miningRewards = await calculateMiningRewards(blockandfeepoolrewards.networkhashps, 1, currencyReserveBridge.vrscBridgePrice);

        /* Get Kaiju volume and reserve info */
        const currencyReserveKaiju = await getCurrencyReserve("kaiju", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const kaijuVolume24Hours = await getCurrencyVolume("kaiju", currentBlock - 1440, currentBlock, 60, "vUSDT.vETH");
        const kaijuVolume7Days = await getCurrencyVolume("kaiju", currentBlock - 1440 * 7, currentBlock, 1440, "vUSDT.vETH");
        const kaijuVolume30Days = await getCurrencyVolume("kaiju", currentBlock - 1440 * 30, currentBlock, 1440, "vUSDT.vETH");

        /* Get pure volume and reserve info */
        const currencyReservePure = await getCurrencyReserve("pure", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const pureVolume24Hours = await getCurrencyVolume("pure", currentBlock - 1440, currentBlock, 60, "vrsc");
        const pureVolume7Days = await getCurrencyVolume("pure", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const pureVolume30Days = await getCurrencyVolume("pure", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

        /* Get switch volume and reserve info */
        const currencyReserveSwitch = await getCurrencyReserve("switch", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const switchVolume24Hours = await getCurrencyVolume("switch", currentBlock - 1440, currentBlock, 60, "DAI.vETH");
        const switchVolume7Days = await getCurrencyVolume("switch", currentBlock - 1440 * 7, currentBlock, 1440, "DAI.vETH");
        const switchVolume30Days = await getCurrencyVolume("switch", currentBlock - 1440 * 30, currentBlock, 1440, "DAI.vETH");

        /* Get nati volume and reserve info */
        const currencyReserveNati = await getCurrencyReserve("nati", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const natiVolume24Hours = await getCurrencyVolume("nati", currentBlock - 1440, currentBlock, 60, "vrsc");
        const natiVolume7Days = await getCurrencyVolume("nati", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const natiVolume30Days = await getCurrencyVolume("nati", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

        /* Get nati🦉 volume and reserve info */
        const currencyReserveNatiOwl = await getCurrencyReserve("nati🦉", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const natiOwlVolume24Hours = await getCurrencyVolume("nati🦉", currentBlock - 1440, currentBlock, 60, "vrsc");
        const natiOwlVolume7Days = await getCurrencyVolume("nati🦉", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const natiOwlVolume30Days = await getCurrencyVolume("nati🦉", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

        /* Get superVRSC volume and reserve info */
        const currencyReserveSuperVRSC = await getCurrencyReserve("supervrsc", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const superVRSCVolume24Hours = await getCurrencyVolume("supervrsc", currentBlock - 1440, currentBlock, 60, "vrsc");
        const superVRSCVolume7Days = await getCurrencyVolume("supervrsc", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const superVRSCVolume30Days = await getCurrencyVolume("supervrsc", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

        /* Get vYIELD volume and reserve info */
        const currencyReserveVyield = await getCurrencyReserve("vyield", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const vyieldVolume24Hours = await getCurrencyVolume("vyield", currentBlock - 1440, currentBlock, 60, "vrsc");
        const vyieldVolume7Days = await getCurrencyVolume("vyield", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const vyieldVolume30Days = await getCurrencyVolume("vyield", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

        /* Get Kek🐸 volume and reserve info */
        const currencyReserveKekFrog = await getCurrencyReserve("Kek🐸", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice);
        const kekFrogVolume24Hours = await getCurrencyVolume("Kek🐸", currentBlock - 1440, currentBlock, 60, "vrsc");
        const kekFrogVolume7Days = await getCurrencyVolume("Kek🐸", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const kekFrogVolume30Days = await getCurrencyVolume("Kek🐸", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");


        //  console.log("currencyReserveKekFrog", currencyReserveKekFrog );
        //  console.log("currencyReserveVyield", currencyReserveVyield )

        /* Get 30 days price data */
        //       const purePriceArray30Days = await getCurrencyPriceArray("pure", currentBlock, 30);
        // console.log("currencyReserveNati ",currencyReserveNati)
        // console.log("natiVolume24Hours ",natiVolume24Hours)
        // console.log("natiVolume7Days ",natiVolume7Days)
        // console.log("natiVolume30Days ",natiVolume30Days)

        const vrscPriceItem = priceArray.find(item => item.currencyId === 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV');
        let marketRank = "###";
        if (vrscPriceItem) {
            marketRank = vrscPriceItem.marketRank;
        }

        vrscRenderData = {
            // Verus
            blocks: blockandfeepoolrewards.block.toLocaleString(),
            blockLastSend: blockandfeepoolrewards.blockLastSend,
            blockReward: blockandfeepoolrewards.blockReward,
            feeReward: blockandfeepoolrewards.feeReward,
            averageblockfees: blockandfeepoolrewards.averageblockfees,
            totalSupply: Math.round(coinSupply.totalSupply).toLocaleString(),
            circulatingSupply: Math.round(coinSupply.circulatingSupply).toLocaleString(),
            circulatingSupplyPercentage: (Math.round(coinSupply.circulatingSupplyPercentage * 100) / 100).toLocaleString(),
            marketCap: Math.round(coinSupply.marketCap).toLocaleString(),
            maxSupply: coinSupply.maxSupply.toLocaleString(),
            fullyDilutedMarketCap: Math.round(coinSupply.fullyDilutedMarketCap).toLocaleString(),
            marketRank: marketRank,
            vrscPriceList: vrscPriceList.priceList,
            stakingAmount: stakingRewards.stakingAmount,
            stakingPercentage: (Math.round(stakingRewards.stakingPercentage * 100) / 100).toLocaleString(),
            stakingRewardsArray: stakingRewards.stakingArray,
            stakingSupply: Math.round(blockandfeepoolrewards.stakingsupply).toLocaleString(),
            stakingValue: Math.round(blockandfeepoolrewards.stakingsupply * currencyReserveBridge.vrscBridgePrice).toLocaleString(),
            stakingAPY: (Math.round(stakingRewards.apy * 10000) / 100).toLocaleString(),
            vrscMiningHash: miningRewards.vrscMiningHash,
            miningRewardsArray: miningRewards.miningArray,
            vrscNetworkHash: (Math.round(blockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
            vrscOnline: vrscNodeStatus.online,
            vrscStatusMessage: vrscNodeStatus.statusMessage,
            getAddressBalanceArray: verusAddressBalance.getAddressBalanceArray,
            getAddress: verusAddressBalance.verusAddress === "none" ? "" : verusAddressBalance.verusAddress,
            bitcoinPrice: bitcoinPrice,
            ethereumBridgePrice: currencyReserveBridge.ethereumBridgePrice,
            vrscBridgePrice: currencyReserveBridge.vrscBridgePrice,
            mkrBridgePrice: currencyReserveBridge.mkrBridgePrice,
            vrscCoingeckoVolume: vrscCoingeckoVolume.toLocaleString(),
            // Verus bridge
            vrscBridgeVolumeInDollars24Hours: vrscVolume24Hours.totalVolume,
            vrscBridgeVolumeInDollars24HoursArray: vrscVolume24Hours.volumeArray,
            vrscBridgeVolumeInDollars24HoursArrayYAxis: vrscVolume24Hours.yAxisArray,
            vrscBridgeVolumeInDollars7Days: vrscVolume7Days.totalVolume,
            vrscBridgeVolumeInDollars7DaysArray: vrscVolume7Days.volumeArray,
            vrscBridgeVolumeInDollars7DaysArrayYAxis: vrscVolume7Days.yAxisArray,
            vrscBridgeVolumeInDollars30Days: vrscVolume30Days.totalVolume,
            vrscBridgeVolumeInDollars30DaysArray: vrscVolume30Days.volumeArray,
            vrscBridgeVolumeInDollars30DaysArrayYAxis: vrscVolume30Days.yAxisArray,
            estimatedBridgeSupply: Math.round(currencyReserveBridge.estimatedBridgeSupply).toLocaleString(),
            estimatedBridgeValueUSD: currencyReserveBridge.estimatedBridgeValueUSD,
            estimatedBridgeValueVRSC: currencyReserveBridge.estimatedBridgeValueVRSC,
            currencyBridgeArray: currencyReserveBridge.currencyBridgeArray,
            estimatedBridgeReserveValue: currencyReserveBridge.estimatedBridgeValue,
            //kaiju
            kaijuVolumeInDollars24Hours: kaijuVolume24Hours.totalVolume,
            kaijuVolumeInDollars24HoursArray: kaijuVolume24Hours.volumeArray,
            kaijuVolumeInDollars24HoursArrayYAxis: kaijuVolume24Hours.yAxisArray,
            kaijuVolumeInDollars7Days: kaijuVolume7Days.totalVolume,
            kaijuVolumeInDollars7DaysArray: kaijuVolume7Days.volumeArray,
            kaijuVolumeInDollars7DaysArrayYAxis: kaijuVolume7Days.yAxisArray,
            kaijuVolumeInDollars30Days: kaijuVolume30Days.totalVolume,
            kaijuVolumeInDollars30DaysArray: kaijuVolume30Days.volumeArray,
            kaijuVolumeInDollars30DaysArrayYAxis: kaijuVolume30Days.yAxisArray,
            estimatedKaijuSupply: Math.round(currencyReserveKaiju.estimatedKaijuSupply).toLocaleString(),
            estimatedKaijuValueUSD: currencyReserveKaiju.estimatedKaijuValueUSD,
            estimatedKaijuValueVRSC: currencyReserveKaiju.estimatedKaijuValueVRSC,
            currencyKaijuArray: currencyReserveKaiju.currencyKaijuArray,
            estimatedKaijuReserveValue: currencyReserveKaiju.estimatedKaijuValue,
            // Verus pure
            currencyVolumePure24Hours: pureVolume24Hours.totalVolume,
            currencyVolumePure24HoursArray: pureVolume24Hours.volumeArray,
            currencyVolumePure24HoursArrayYAxis: pureVolume24Hours.yAxisArray,
            currencyVolumePure7Days: pureVolume7Days.totalVolume,
            currencyVolumePure7DaysArray: pureVolume7Days.volumeArray,
            currencyVolumePure7DaysArrayYAxis: pureVolume7Days.yAxisArray,
            currencyVolumePure30Days: pureVolume30Days.totalVolume,
            currencyVolumePure30DaysArray: pureVolume30Days.volumeArray,
            currencyVolumePure30DaysArrayYAxis: pureVolume30Days.yAxisArray,
            currencyPureArray: currencyReservePure.currencyPureArray,
            estimatedPureSupply: Math.round(currencyReservePure.estimatedPureSupply).toLocaleString(),
            estimatedPureValueUSD: currencyReservePure.estimatedPureValueUSD,
            estimatedPureValueVRSC: currencyReservePure.estimatedPureValueVRSC,
            estimatedPureReserveValueUSDBTC: currencyReservePure.estimatedPureValueUSDBTC,
            estimatedPureReserveValueUSDVRSC: currencyReservePure.estimatedPureValueUSDVRSC,
            // Verus switch
            currencyVolumeSwitch24Hours: switchVolume24Hours.totalVolume,
            currencyVolumeSwitch24HoursArray: switchVolume24Hours.volumeArray,
            currencyVolumeSwitch24HoursArrayYAxis: switchVolume24Hours.yAxisArray,
            currencyVolumeSwitch7Days: switchVolume7Days.totalVolume,
            currencyVolumeSwitch7DaysArray: switchVolume7Days.volumeArray,
            currencyVolumeSwitch7DaysArrayYAxis: switchVolume7Days.yAxisArray,
            currencyVolumeSwitch30Days: switchVolume30Days.totalVolume,
            currencyVolumeSwitch30DaysArray: switchVolume30Days.volumeArray,
            currencyVolumeSwitch30DaysArrayYAxis: switchVolume30Days.yAxisArray,
            currencySwitchArray: currencyReserveSwitch.currencySwitchArray,
            estimatedSwitchSupply: Math.round(currencyReserveSwitch.estimatedSwitchSupply).toLocaleString(),
            estimatedSwitchValue: currencyReserveSwitch.estimatedSwitchValue,
            estimatedSwitchReserveValue: currencyReserveSwitch.estimatedSwitcheReserveValue,
            estimatedSwitchValueUSDVRSC: currencyReserveSwitch.estimatedSwitchValueUSDVRSC,
            estimatedSwitchValueVRSC: currencyReserveSwitch.estimatedSwitchValueVRSC,
            // Verus nati
            currencyVolumeNati24Hours: natiVolume24Hours.totalVolume,
            currencyVolumeNati24HoursArray: natiVolume24Hours.volumeArray,
            currencyVolumeNati24HoursArrayYAxis: natiVolume24Hours.yAxisArray,
            currencyVolumeNati7Days: natiVolume7Days.totalVolume,
            currencyVolumeNati7DaysArray: natiVolume7Days.volumeArray,
            currencyVolumeNati7DaysArrayYAxis: natiVolume7Days.yAxisArray,
            currencyVolumeNati30Days: natiVolume30Days.totalVolume,
            currencyVolumeNati30DaysArray: natiVolume30Days.volumeArray,
            currencyVolumeNati30DaysArrayYAxis: natiVolume30Days.yAxisArray,
            currencyNatiArray: currencyReserveNati.currencyNatiArray,
            estimatedNatiSupply: Math.round(currencyReserveNati.estimatedNatiSupply).toLocaleString(),
            estimatedNatiValueUSD: currencyReserveNati.estimatedNatiValueUSD,
            estimatedNatiValueVRSC: currencyReserveNati.estimatedNatiValueVRSC,
            estimatedNatiReserveValueUSDNATI: currencyReserveNati.estimatedNatiValueUSDNATI,
            estimatedNatiReserveValueUSDVRSC: currencyReserveNati.estimatedNatiValueUSDVRSC,
            // Verus nati Owl
            currencyVolumeNatiOwl24Hours: natiOwlVolume24Hours.totalVolume,
            currencyVolumeNatiOwl24HoursArray: natiOwlVolume24Hours.volumeArray,
            currencyVolumeNatiOwl24HoursArrayYAxis: natiOwlVolume24Hours.yAxisArray,
            currencyVolumeNatiOwl7Days: natiOwlVolume7Days.totalVolume,
            currencyVolumeNatiOwl7DaysArray: natiOwlVolume7Days.volumeArray,
            currencyVolumeNatiOwl7DaysArrayYAxis: natiOwlVolume7Days.yAxisArray,
            currencyVolumeNatiOwl30Days: natiOwlVolume30Days.totalVolume,
            currencyVolumeNatiOwl30DaysArray: natiOwlVolume30Days.volumeArray,
            currencyVolumeNatiOwl30DaysArrayYAxis: natiOwlVolume30Days.yAxisArray,
            currencyNatiOwlArray: currencyReserveNatiOwl.currencyNatiOwlArray,
            estimatedNatiOwlSupply: Math.round(currencyReserveNatiOwl.estimatedNatiOwlSupply).toLocaleString(),
            estimatedNatiOwlValueUSD: currencyReserveNatiOwl.estimatedNatiOwlValueUSD,
            estimatedNatiOwlValueVRSC: currencyReserveNatiOwl.estimatedNatiOwlValueVRSC,
            estimatedNatiOwlReserveValueUSDtBTC: currencyReserveNatiOwl.estimatedNatiOwlValueUSDtBTC,
            estimatedNatiOwlReserveValueUSDVRSC: currencyReserveNatiOwl.estimatedNatiOwlValueUSDVRSC,
            // Verus supervrsc
            currencyVolumeSuperVRSC24Hours: superVRSCVolume24Hours.totalVolume,
            currencyVolumeSuperVRSC24HoursArray: superVRSCVolume24Hours.volumeArray,
            currencyVolumeSuperVRSC24HoursArrayYAxis: superVRSCVolume24Hours.yAxisArray,
            currencyVolumeSuperVRSC7Days: superVRSCVolume7Days.totalVolume,
            currencyVolumeSuperVRSC7DaysArray: superVRSCVolume7Days.volumeArray,
            currencyVolumeSuperVRSC7DaysArrayYAxis: superVRSCVolume7Days.yAxisArray,
            currencyVolumeSuperVRSC30Days: superVRSCVolume30Days.totalVolume,
            currencyVolumeSuperVRSC30DaysArray: superVRSCVolume30Days.volumeArray,
            currencyVolumeSuperVRSC30DaysArrayYAxis: superVRSCVolume30Days.yAxisArray,
            currencySuperVRSCArray: currencyReserveSuperVRSC.currencySuperVRSCArray,
            estimatedSuperVRSCSupply: Math.round(currencyReserveSuperVRSC.estimatedSuperVRSCSupply).toLocaleString(),
            estimatedSuperVRSCValueUSD: currencyReserveSuperVRSC.estimatedSuperVRSCValueUSD,
            estimatedSuperVRSCValueVRSC: currencyReserveSuperVRSC.estimatedSuperVRSCValueVRSC,
            estimatedSuperVRSCReserveValueUSDSuperVRSC: currencyReserveSuperVRSC.estimatedSuperVRSCValueUSDSuperVRSC,
            estimatedSuperVRSCReserveValueUSDVRSC: currencyReserveSuperVRSC.estimatedSuperVRSCValueUSDVRSC,
            // vYIELD
            currencyVolumeVyield24Hours: vyieldVolume24Hours.totalVolume,
            currencyVolumeVyield24HoursArray: vyieldVolume24Hours.volumeArray,
            currencyVolumeVyield24HoursArrayYAxis: vyieldVolume24Hours.yAxisArray,
            currencyVolumeVyield7Days: vyieldVolume7Days.totalVolume,
            currencyVolumeVyield7DaysArray: vyieldVolume7Days.volumeArray,
            currencyVolumeVyield7DaysArrayYAxis: vyieldVolume7Days.yAxisArray,
            currencyVolumeVyield30Days: vyieldVolume30Days.totalVolume,
            currencyVolumeVyield30DaysArray: vyieldVolume30Days.volumeArray,
            currencyVolumeVyield30DaysArrayYAxis: vyieldVolume30Days.yAxisArray,
            currencyVyieldArray: currencyReserveVyield.currencyVyieldArray,
            estimatedVyieldSupply: Math.round(currencyReserveVyield.estimatedVyieldSupply).toLocaleString(),
            estimatedVyieldValueUSD: currencyReserveVyield.estimatedVyieldValueUSD,
            estimatedVyieldValueVRSC: currencyReserveVyield.estimatedVyieldValueVRSC,
            estimatedVyieldReserveValue: currencyReserveVyield.estimatedVyieldReserveValue,
            estimatedVyieldValue: currencyReserveVyield.estimatedVyieldValue,
            estimatedVyieldValueUSDVRSC: currencyReserveVyield.estimatedVyieldValueUSDVRSC,
            // KekFrog
            currencyVolumeKekFrog24Hours: kekFrogVolume24Hours.totalVolume,
            currencyVolumeKekFrog24HoursArray: kekFrogVolume24Hours.volumeArray,
            currencyVolumeKekFrog24HoursArrayYAxis: kekFrogVolume24Hours.yAxisArray,
            currencyVolumeKekFrog7Days: kekFrogVolume7Days.totalVolume,
            currencyVolumeKekFrog7DaysArray: kekFrogVolume7Days.volumeArray,
            currencyVolumeKekFrog7DaysArrayYAxis: kekFrogVolume7Days.yAxisArray,
            currencyVolumeKekFrog30Days: kekFrogVolume30Days.totalVolume,
            currencyVolumeKekFrog30DaysArray: kekFrogVolume30Days.volumeArray,
            currencyVolumeKekFrog30DaysArrayYAxis: kekFrogVolume30Days.yAxisArray,
            currencyKekFrogArray: currencyReserveKekFrog.currencyKekFrogArray,
            estimatedKekFrogSupply: Math.round(currencyReserveKekFrog.estimatedKekFrogSupply).toLocaleString(),
            estimatedKekFrogValueUSD: currencyReserveKekFrog.estimatedKekFrogValueUSD,
            estimatedKekFrogValueVRSC: currencyReserveKekFrog.estimatedKekFrogValueVRSC,
            estimatedKekFrogReserveValue: currencyReserveKekFrog.estimatedKekFrogReserveValue,
            estimatedKekFrogValue: currencyReserveKekFrog.estimatedKekFrogValue,
            estimatedKekFrogValueUSDVRSC: currencyReserveKekFrog.estimatedKekFrogValueUSDVRSC
        };

        // check fetching error
        let fetchingError = await client.get("fetchingerror");
        if (fetchingError === "false") {
            // adding to pricingArray
            priceArray = [...priceArray,
            ...vrscRenderData.currencyBridgeArray,
            ...vrscRenderData.currencyKaijuArray,
            ...vrscRenderData.currencyPureArray,
            ...vrscRenderData.currencySwitchArray,
            ...vrscRenderData.currencyNatiArray,
            ...vrscRenderData.currencyNatiOwlArray,
            ...vrscRenderData.currencySuperVRSCArray,
            ...vrscRenderData.currencyVyieldArray,
            ...vrscRenderData.currencyKekFrogArray
            ];

            // adding to reserveArray
            vrscReserveArray = [...vrscReserveArray,
            { basket: "Bridge.vETH", reserve: currencyReserveBridge.estimatedBridgeValue, via: "" },
            { basket: "Kaiju", reserve: currencyReserveKaiju.estimatedKaijuValue, via: "" },
            { basket: "Pure", reserve: currencyReservePure.estimatedPureValueUSDVRSC, via: "via VRSC" },
            { basket: "Switch", reserve: currencyReserveSwitch.estimatedSwitcheReserveValue, via: "" },
            { basket: "NATI", reserve: currencyReserveNati.estimatedNatiValueUSDVRSC, via: "via VRSC" },
            { basket: "NATI🦉", reserve: currencyReserveNatiOwl.estimatedNatiOwlValueUSDVRSC, via: "via VRSC" },
            { basket: "SUPERVRSC", reserve: currencyReserveSuperVRSC.estimatedSuperVRSCValueUSDVRSC, via: "via VRSC" },
            { basket: "vYIELD", reserve: currencyReserveVyield.estimatedVyieldReserveValue, via: "via VRSC" },
            { basket: "Kek🐸", reserve: currencyReserveKekFrog.estimatedKekFrogValueUSDVRSC, via: "via VRSC" }
            ];

            // adding to 24H volume array
            vrsc24HVolumeArray = [...vrsc24HVolumeArray, { basket: "Bridge.vETH", volume: vrscVolume24Hours.totalVolume, via: "" },
            { basket: "Kaiju", volume: kaijuVolume24Hours.totalVolume, via: "" },
            { basket: "Pure", volume: ((Math.round(parseFloat((pureVolume24Hours.totalVolume === 0 ? "0" : pureVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" },
            { basket: "Switch", volume: switchVolume24Hours.totalVolume, via: "" },
            { basket: "NATI", volume: ((Math.round(parseFloat((natiVolume24Hours.totalVolume === 0 ? "0" : natiVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" },
            { basket: "NATI🦉", volume: ((Math.round(parseFloat((natiOwlVolume24Hours.totalVolume === 0 ? "0" : natiOwlVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" },
            { basket: "SUPERVRSC", volume: ((Math.round(parseFloat((superVRSCVolume24Hours.totalVolume === 0 ? "0" : superVRSCVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" },
            { basket: "vYIELD", volume: ((Math.round(parseFloat((vyieldVolume24Hours.totalVolume === 0 ? "0" : vyieldVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" },
            { basket: "Kek🐸", volume: ((Math.round(parseFloat((kekFrogVolume24Hours.totalVolume === 0 ? "0" : kekFrogVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" }
            ]
        }

    } else {
        vrscRenderData = {
            vrscNodeStatus: vrscNodeStatus.online,
            vrscStatusMessage: vrscNodeStatus.statusMessage
        }
    }
    mainRenderData = vrscRenderData;




    /* Verus vARRR */
    let varrrRenderData = {};
    const varrrNodeStatus = await getVarrrNodeStatus();

    if (varrrNodeStatus.online === true) {

        /* Get address balance */
        const varrrAddressBalance = await getVarrrAddressBalance("");

        /* Get block and fee pool rewards */
        const varrrblockandfeepoolrewards = await getVarrrBlockAndFeePoolRewards();
        const currentBlock = varrrblockandfeepoolrewards.block;

        /* Get bridge.varrr volume and reserve info */
        const currencyReserveVarrrBridge = await getVarrrCurrencyReserve("bridge.varrr", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);
        const varrrVolume24Hours = await getVarrrCurrencyVolume("bridge.varrr", currentBlock - 1440, currentBlock, 60, "vrsc");
        const varrrVolume7Days = await getVarrrCurrencyVolume("bridge.varrr", currentBlock - 1440 * 7, currentBlock, 1440, "vrsc");
        const varrrVolume30Days = await getVarrrCurrencyVolume("bridge.varrr", currentBlock - 1440 * 30, currentBlock, 1440, "vrsc");

        const varrrBridgePrice = currencyReserveVarrrBridge.currencyVarrrBridgeArray.find(item => item.currencyName === 'vARRR').price;

        /* Get vARRR price list*/
        const varrrPriceList = await getVarrrPriceList(varrrBridgePrice);

        /* Calculate varrr staking rewards */
        const varrrStakingRewards = await calculateVarrrStakingRewards(varrrblockandfeepoolrewards.stakingsupply, 100, varrrBridgePrice);

        /* Calculate varrr mining rewards */
        const varrrMiningRewards = await calculateVarrrMiningRewards(varrrblockandfeepoolrewards.networkhashps, 1, varrrBridgePrice);

        varrrRenderData = {
            //varrr
            varrrOnline: varrrNodeStatus.online,
            getVarrrAddressBalanceArray: varrrAddressBalance.getAddressBalanceArray,
            getVarrrAddress: varrrAddressBalance.verusAddress === "none" ? "" : varrrAddressBalance.verusAddress,
            varrrblocks: varrrblockandfeepoolrewards.block.toLocaleString(),
            varrrblockLastSend: varrrblockandfeepoolrewards.blockLastSend,
            varrrblockReward: varrrblockandfeepoolrewards.blockReward,
            varrrfeeReward: varrrblockandfeepoolrewards.feeReward,
            varrraverageblockfees: varrrblockandfeepoolrewards.averageblockfees,
            varrrPriceList: varrrPriceList.priceList,
            varrrStakingAmount: varrrStakingRewards.stakingAmount,
            varrrStakingRewardsArray: varrrStakingRewards.stakingArray,
            varrrStakingSupply: Math.round(varrrblockandfeepoolrewards.stakingsupply).toLocaleString(),
            varrrStakingAPY: (Math.round(varrrStakingRewards.apy * 10000) / 100).toLocaleString(),
            varrrMiningHash: varrrMiningRewards.varrrMiningHash,
            varrrMiningRewardsArray: varrrMiningRewards.miningArray,
            varrrNetworkHash: (Math.round(varrrblockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
            //varrr bridge
            varrrBridgeVolumeInDollars24Hours: varrrVolume24Hours.totalVolume,
            varrrBridgeVolumeInDollars24HoursArray: varrrVolume24Hours.volumeArray,
            varrrBridgeVolumeInDollars24HoursArrayYAxis: varrrVolume24Hours.yAxisArray,
            varrrBridgeVolumeInDollars7Days: varrrVolume7Days.totalVolume,
            varrrBridgeVolumeInDollars7DaysArray: varrrVolume7Days.volumeArray,
            varrrBridgeVolumeInDollars7DaysArrayYAxis: varrrVolume7Days.yAxisArray,
            varrrBridgeVolumeInDollars30Days: varrrVolume30Days.totalVolume,
            varrrBridgeVolumeInDollars30DaysArray: varrrVolume30Days.volumeArray,
            varrrBridgeVolumeInDollars30DaysArrayYAxis: varrrVolume30Days.yAxisArray,
            currencyVarrrBridgeArray: currencyReserveVarrrBridge.currencyVarrrBridgeArray,
            estimatedVarrrBridgeSupply: Math.round(currencyReserveVarrrBridge.estimatedVarrrBridgeSupply).toLocaleString(),
            estimatedVarrrBridgeValueUSD: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSD,
            estimatedVarrrBridgeValueVRSC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueVRSC,
            estimatedVarrrBridgeReserveValueUSDBTC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDBTC,
            estimatedVarrrBridgeReserveValueUSDVRSC: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDVRSC
        }
        // check fetching error
        let fetchingError = await client.get("fetchingerror");
        if (fetchingError === "false") {
            priceArray = [...priceArray, ...varrrRenderData.currencyVarrrBridgeArray];
            vrscReserveArray = [...vrscReserveArray, { basket: "Bridge.vARRR", reserve: currencyReserveVarrrBridge.estimatedVarrrBridgeValueUSDVRSC, via: "via VRSC" }];
            vrsc24HVolumeArray = [...vrsc24HVolumeArray, { basket: "Bridge.vARRR", volume: ((Math.round(parseFloat((varrrVolume24Hours.totalVolume === 0 ? "0" : varrrVolume24Hours.totalVolume).replace(/,/g, '')) * currencyReserveBridge.vrscBridgePrice) * 100) / 100).toLocaleString(), via: "via VRSC" }]
        }
    } else {
        varrrRenderData = {
            varrrOnline: varrrNodeStatus.online,
            varrrStatusMessage: varrrNodeStatus.statusMessage
        }
    }
    mainRenderData = { ...mainRenderData, ...varrrRenderData };

    /* Verus vDEX */
    let vdexRenderData = {};
    const vdexNodeStatus = await getVdexNodeStatus();

    if (vdexNodeStatus.online === true) {

        /* Get address balance */
        const vdexAddressBalance = await getVdexAddressBalance("");

        /* Get block and fee pool rewards */
        const vdexblockandfeepoolrewards = await getVdexBlockAndFeePoolRewards();
        const currentBlock = vdexblockandfeepoolrewards.block;

        /* Get bridge.vdex volume and reserve info */
        const currencyReserveVdexBridge = await getVdexCurrencyReserve("bridge.vdex", coingeckoPriceArray, currencyReserveBridge.vrscBridgePrice, currencyReserveBridge.estimatedBridgeValueUSD);
        const vdexVolume24Hours = await getVdexCurrencyVolume("bridge.vdex", currentBlock - 1440, currentBlock, 60, "DAI.vETH");
        const vdexVolume7Days = await getVdexCurrencyVolume("bridge.vdex", currentBlock - 1440 * 7, currentBlock, 1440, "DAI.vETH");
        const vdexVolume30Days = await getVdexCurrencyVolume("bridge.vdex", currentBlock - 1440 * 30, currentBlock, 1440, "DAI.vETH");
        const vdexBridgePrice = currencyReserveVdexBridge.currencyBridgeArray.find(item => item.currencyName === 'vDEX').price;

        /* Get vdex price list*/
        const vdexPriceList = await getVdexPriceList(vdexBridgePrice);

        /* Calculate vdex staking rewards */
        const vdexStakingRewards = await calculateVdexStakingRewards(vdexblockandfeepoolrewards.stakingsupply, 100, vdexBridgePrice);

        /* Calculate vdex mining rewards */
        const vdexMiningRewards = await calculateVdexMiningRewards(vdexblockandfeepoolrewards.networkhashps, 1, vdexBridgePrice);

        vdexRenderData = {
            //vdex
            vdexOnline: vdexNodeStatus.online,
            getVdexAddressBalanceArray: vdexAddressBalance.getAddressBalanceArray,
            getVdexAddress: vdexAddressBalance.verusAddress === "none" ? "" : vdexAddressBalance.verusAddress,
            vdexblocks: vdexblockandfeepoolrewards.block.toLocaleString(),
            vdexblockLastSend: vdexblockandfeepoolrewards.blockLastSend,
            vdexblockReward: vdexblockandfeepoolrewards.blockReward,
            vdexfeeReward: vdexblockandfeepoolrewards.feeReward,
            vdexaverageblockfees: vdexblockandfeepoolrewards.averageblockfees,
            vdexPriceList: vdexPriceList.priceList,
            vdexStakingAmount: vdexStakingRewards.stakingAmount,
            vdexStakingRewardsArray: vdexStakingRewards.stakingArray,
            vdexStakingSupply: Math.round(vdexblockandfeepoolrewards.stakingsupply).toLocaleString(),
            vdexStakingAPY: (Math.round(vdexStakingRewards.apy * 10000) / 100).toLocaleString(),
            vdexMiningHash: vdexMiningRewards.vdexMiningHash,
            vdexMiningRewardsArray: vdexMiningRewards.miningArray,
            vdexNetworkHash: (Math.round(vdexblockandfeepoolrewards.networkhashps) / 1000000000).toLocaleString(),
            //vdex bridge
            vdexBridgeVolumeInDollars24Hours: vdexVolume24Hours.totalVolume,
            vdexBridgeVolumeInDollars24HoursArray: vdexVolume24Hours.volumeArray,
            vdexBridgeVolumeInDollars24HoursArrayYAxis: vdexVolume24Hours.yAxisArray,
            vdexBridgeVolumeInDollars7Days: vdexVolume7Days.totalVolume,
            vdexBridgeVolumeInDollars7DaysArray: vdexVolume7Days.volumeArray,
            vdexBridgeVolumeInDollars7DaysArrayYAxis: vdexVolume7Days.yAxisArray,
            vdexBridgeVolumeInDollars30Days: vdexVolume30Days.totalVolume,
            vdexBridgeVolumeInDollars30DaysArray: vdexVolume30Days.volumeArray,
            vdexBridgeVolumeInDollars30DaysArrayYAxis: vdexVolume30Days.yAxisArray,
            currencyVdexBridgeArray: currencyReserveVdexBridge.currencyBridgeArray,
            estimatedVdexBridgeReserveValue: currencyReserveVdexBridge.estimatedBridgeValue,
            estimatedVdexBridgeSupply: Math.round(currencyReserveVdexBridge.estimatedBridgeSupply).toLocaleString(),
            estimatedVdexBridgeValueUSD: currencyReserveVdexBridge.estimatedBridgeValueUSD,
            estimatedVdexBridgeValueVRSC: currencyReserveVdexBridge.estimatedBridgeValueVRSC,
            estimatedVdexBridgeReserveValueUSDBTC: currencyReserveVdexBridge.estimatedBridgeValueUSDBTC,
            estimatedVdexBridgeReserveValueUSDVRSC: currencyReserveVdexBridge.estimatedBridgeValueUSDVRSC
        }
        // check fetching error
        let fetchingError = await client.get("fetchingerror");
        if (fetchingError === "false") {
            priceArray = [...priceArray, ...vdexRenderData.currencyVdexBridgeArray];
            vrscReserveArray = [...vrscReserveArray, { basket: "Bridge.vDEX", reserve: currencyReserveVdexBridge.estimatedBridgeValue, via: "" }];
            vrsc24HVolumeArray = [...vrsc24HVolumeArray, { basket: "Bridge.vDEX", volume: vdexVolume24Hours.totalVolume, via: "" }]
        }
    } else {
        vdexRenderData = {
            vdexOnline: vdexNodeStatus.online,
            vdexStatusMessage: vdexNodeStatus.statusMessage
        }
    }
    mainRenderData = { ...mainRenderData, ...vdexRenderData };

    let btcPriceArray = priceArray.filter(item => item.currencyId === 'iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU').sort((a, b) => b.price - a.price);
    let ethereumPriceArray = priceArray.filter(item => item.currencyId === 'i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X').sort((a, b) => b.price - a.price);
    let makerPriceArray = priceArray.filter(item => item.currencyId === 'iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4').sort((a, b) => b.price - a.price);
    let vrscPriceArray = priceArray.filter(item => item.currencyId === 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV').sort((a, b) => b.price - a.price);
    let arrrPriceArray = priceArray.filter(item => item.currencyId === 'iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2').sort((a, b) => b.price - a.price);

    let btcReserve = 0;
    priceArray.filter(item => item.currencyId === 'iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU').map( (item) =>{ return btcReserve += (Number(item.reserves === undefined ? 0 : item.reserves.replace(/,/g, '')) || 0);})
    btcReserve = Math.round(btcReserve)
    let btcReserveValue = (btcReserve*bitcoinPriceItem?.price).toLocaleString() || "0";
   
    let ethReserve = 0;
    priceArray.filter(item => item.currencyId === 'i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X').map( (item) =>{ return ethReserve += (Number(item.reserves === undefined ? 0 : item.reserves.replace(/,/g, '')) || 0);})
    ethReserve = Math.round(ethReserve)
    let ethReserveValue = (ethReserve*ethereumPriceItem?.price).toLocaleString() || "0";

    // check fetching error
    let fetchingError = await client.get("fetchingerror");
    if (fetchingError === "false") {
        vrscReserveArray.sort((a, b) => parseFloat(b.reserve.replace(/,/g, '')) - parseFloat(a.reserve.replace(/,/g, '')));
        vrsc24HVolumeArray.sort((a, b) => parseFloat((b.volume === 0 ? "0" : b.volume).replace(/,/g, '')) - parseFloat((a.volume === 0 ? "0" : a.volume).replace(/,/g, '')));

        // Total reserve volume
        vrscReserveArray.map(item => {
            vrscReserveTotal = vrscReserveTotal + parseFloat((item.reserve === 0 ? "0" : item.reserve).replace(/,/g, ''));
        })
        vrscReserveTotal = vrscReserveTotal.toLocaleString();

        // Total 24H volume
        vrsc24HVolumeArray.map(item => {
            vrsc24HVolumeTotal = vrsc24HVolumeTotal + parseFloat((item.volume === 0 ? "0" : item.volume).replace(/,/g, ''));
        })
        vrsc24HVolumeTotal = vrsc24HVolumeTotal.toLocaleString();
    }

    mainRenderData = { ...mainRenderData, ...{ 
        btcPriceArray, 
        ethereumPriceArray,
        makerPriceArray, 
        vrscPriceArray, 
        arrrPriceArray,
        btcReserve,
        btcReserveValue,
        ethReserve,
        ethReserveValue, 
        vrscReserveArray, 
        vrsc24HVolumeArray, 
        vrscReserveTotal, 
        vrsc24HVolumeTotal 
    } };


    // ThreeFold //
    let threeFoldNodeArray = []
    let threefoldNodeString = "";
    // if (req.query.tfnodes) {
    //     threefoldNodeString = decodeURIComponent(req.query.tfnodes);
    //     threeFoldNodeArray = await getThreeFoldNodeArray(threefoldNodeString);
    // } else {
    //     threefoldNodeString = "none";
    // }

    const threeFoldRenderData = {
        // ThreeFold
        threeFoldNodeArray: threeFoldNodeArray,
        threefoldNodeString: threefoldNodeString === "none" ? "" : threefoldNodeString
    }
    mainRenderData = { ...mainRenderData, ...threeFoldRenderData };



    ////////////////////////

    return mainRenderData;
}

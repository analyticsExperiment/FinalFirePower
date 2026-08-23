< script >

    console.log("========== GUIDED DEBUG : SCRIPT START ==========");
console.log("[GUIDED DEBUG] Time:", new Date().toISOString());
console.log("[GUIDED DEBUG] Existing window.activityPriorityExp:", window.activityPriorityExp);
console.log("[GUIDED DEBUG] Existing bannerDisplayNos:", sessionStorage.getItem('bannerDisplayNos'));
console.log("[GUIDED DEBUG] Existing otherBannerCount:", sessionStorage.getItem('otherBannerCount'));
console.log("=================================================");

window.guidedDesktopexecutor = true;
var isBannerAddedguided = false;
var guidedPriority = '';
window.activityPriorityExp = window.activityPriorityExp || [];
window.activityPriorityExp.push(guidedPriority);

console.log("[GUIDED DEBUG] guidedPriority registered:", guidedPriority);
console.log("[GUIDED DEBUG] activityPriorityExp after push:", window.activityPriorityExp);


window.otherActivitiesfinder = function otherActivitiesfinder() {

    console.log("---------- GUIDED DEBUG : otherActivitiesfinder START ----------");

    window.eligibleactivities = _satellite.getVar('activityNames');

    console.log("[GUIDED DEBUG] activityNames from Launch:", window.eligibleactivities);

    var data = {
        '255024|2024.10|D1|WM-Self-Directed|Non-Prod': 'active',
        'D1 | WM Advisory | PROD': 'active'
    };

    console.log("[GUIDED DEBUG] Other activity configuration:", data);

    var count = 0;

    for (var i in data) {

        console.log("[GUIDED DEBUG] Checking configured activity:", i);

        if (window.eligibleactivities && window.eligibleactivities.length > 0) {

            for (var j = 0; j < window.eligibleactivities.length; j++) {

                console.log(
                    "[GUIDED DEBUG] Comparing eligible activity:",
                    window.eligibleactivities[j],
                    "with configured activity:",
                    i
                );

                if (window.eligibleactivities[j] == i && data[i] == 'active') {

                    count++

                    console.log(
                        "[GUIDED DEBUG] MATCH FOUND. Other eligible count now:",
                        count
                    );
                }
            }
        }
    }

    console.log("[GUIDED DEBUG] Final otherActivitiesfinder count:", count);
    console.log("---------- GUIDED DEBUG : otherActivitiesfinder END ------------");

    return count;
}


function addBannerguided(selector, featureName, imageURL) {

    console.log("---------- GUIDED DEBUG : addBannerguided START ----------");
    console.log("[GUIDED DEBUG] Selector:", selector);
    console.log("[GUIDED DEBUG] featureName:", featureName);
    console.log("[GUIDED DEBUG] imageURL:", imageURL);
    console.log("[GUIDED DEBUG] isBannerAddedguided before:", isBannerAddedguided);

    var bannerContainer = document.querySelector(selector);

    console.log("[GUIDED DEBUG] bannerContainer found:", bannerContainer);

    if (bannerContainer && !isBannerAddedguided) {

        console.log("[GUIDED DEBUG] Banner allowed to be injected into:", selector);

        bannerContainer.innerHTML =
            '<a onclick="navigateTo({featureName:\'' + featureName + '\'})">' +
            '<img id="adobeBannerOfferImage" onclick="myFunctionguided(\'' + featureName + '\', \'GUIDED_INVESTING\')" ' +
            'data-idp-default="true" src="https://cms-assets.citi.com/9j7wv5nnfw5f/3tkFE08rmJ0Py4Hb024u3d/ea650b6db6d1e3effde01f9e9722bfe3/Marketing_D1-banner_Guided-Investing-online-banking_life-goals.png"></img></a>';

        bannerContainer.style.textAlign = selector == '#citAdobeData' ? 'center' : '';

        console.log("Banner added");

        console.log("[GUIDED DEBUG] Banner HTML injected successfully");

        window.offerImpression = {
            featureName: 'GUIDED_INVESTING'
        };

        console.log("[GUIDED DEBUG] window.offerImpression:", window.offerImpression);
        console.log("[GUIDED DEBUG] About to fire offer_impression");

        _satellite.track("offer_impression", {
            featureName: 'GUIDED_INVESTING',
            imageURL: 'https://cms-assets.citi.com/9j7wv5nnfw5f/3tkFE08rmJ0Py4Hb024u3d/ea650b6db6d1e3effde01f9e9722bfe3/Marketing_D1-banner_Guided-Investing-online-banking_life-goals.png'
        })

        console.log("[GUIDED DEBUG] offer_impression fired");

        document.querySelector('[name="containerAdobeBanner"]').style.display = 'block';

        console.log("[GUIDED DEBUG] containerAdobeBanner display set to block");

        isBannerAddedguided = true;

        console.log("[GUIDED DEBUG] isBannerAddedguided after:", isBannerAddedguided);
    } else {

        console.log(
            "[GUIDED DEBUG] Banner NOT injected. Container exists:",
            !!bannerContainer,
            "| isBannerAddedguided:",
            isBannerAddedguided
        );
    }

    console.log("---------- GUIDED DEBUG : addBannerguided END ------------");
}


function myFunctionguided(offerID, featureName, buttonText) {

    console.log("---------- GUIDED DEBUG : CLICK START ----------");
    console.log("[GUIDED DEBUG] offerID:", offerID);
    console.log("[GUIDED DEBUG] featureName:", featureName);
    console.log("[GUIDED DEBUG] buttonText:", buttonText);
    console.log("[GUIDED DEBUG] isBodyClickedguided before:", isBodyClickedguided);

    if (!isBodyClickedguided) {

        console.log("[GUIDED DEBUG] Firing D1 Banner click");

        _satellite.track("D1 Banner click", {
            featureName: "GUIDED_INVESTING"
        });

        console.log("[GUIDED DEBUG] D1 Banner click fired");

        document.querySelector("#adobeBannerOffer,#citAdobeData").removeEventListener('click', myFunctionguided);

        console.log("[GUIDED DEBUG] Click listener removed");
    }

    isBodyClickedguided = true;

    console.log("[GUIDED DEBUG] isBodyClickedguided after:", isBodyClickedguided);
    console.log("---------- GUIDED DEBUG : CLICK END ------------");
}


function getRandomBannerguided() {

    console.log("---------- GUIDED DEBUG : getRandomBannerguided START ----------");

    var guidedbannerObj = {
        featureName: 'GUIDED_INVESTING',
        imageURL: 'https://cms-assets.citi.com/9j7wv5nnfw5f/3tkFE08rmJ0Py4Hb024u3d/ea650b6db6d1e3effde01f9e9722bfe3/Marketing_D1-banner_Guided-Investing-online-banking_life-goals.png',
        offerID: ''
    };

    console.log("[GUIDED DEBUG] guidedbannerObj:", guidedbannerObj);

    console.log("[GUIDED DEBUG] Attempting #adobeBannerOffer injection");

    addBannerguided('#adobeBannerOffer', guidedbannerObj.featureName, guidedbannerObj.imageURL, guidedbannerObj.offerID);

    console.log("[GUIDED DEBUG] Attempting #citAdobeData injection");

    addBannerguided('#citAdobeData', guidedbannerObj.featureName, guidedbannerObj.imageURL, guidedbannerObj.offerID);

    console.log("---------- GUIDED DEBUG : getRandomBannerguided END ------------");
}


window.uniqueExtractor = function uniqueExtractor(param) {

    console.log("---------- GUIDED DEBUG : uniqueExtractor START ----------");
    console.log("[GUIDED DEBUG] uniqueExtractor input:", param);

    var temp = [];

    for (var i = 0; i < param.length; i++) {

        if (temp.indexOf(param[i]) == -1) {

            temp.push(param[i]);
        }
    }

    console.log("[GUIDED DEBUG] uniqueExtractor output:", temp);
    console.log("---------- GUIDED DEBUG : uniqueExtractor END ------------");

    return temp;
}


//Returns Whether this activity is eligible enough to be displayed or not
if (typeof window.priorityEvaluator != 'function') {

    console.log("[GUIDED DEBUG] Creating window.priorityEvaluator");

    window.priorityEvaluator = function priorityEvaluator(param) {

        console.log("---------- GUIDED DEBUG : priorityEvaluator START ----------");
        console.log("[GUIDED DEBUG] Priority being evaluated:", param);
        console.log("[GUIDED DEBUG] activityPriorityExp:", window.activityPriorityExp);
        console.log("[GUIDED DEBUG] bannerDisplayNos raw:", sessionStorage.getItem('bannerDisplayNos'));

        if (param) {

            var uniqueExps = window.uniqueExtractor(window.activityPriorityExp);

            console.log("[GUIDED DEBUG] uniqueExps:", uniqueExps);
            console.log("[GUIDED DEBUG] uniqueExps.length:", uniqueExps.length);

            for (var i = 0; i < uniqueExps.length; i++) {

                var local = uniqueExps[i];

                console.log("[GUIDED DEBUG] Evaluating registered priority:", local);

                var bannerDisplayNos = sessionStorage.getItem('bannerDisplayNos') ?
                    JSON.parse(sessionStorage.getItem('bannerDisplayNos')) :
                    [];

                console.log("[GUIDED DEBUG] Current bannerDisplayNos:", bannerDisplayNos);

                if (bannerDisplayNos.indexOf(local) == -1 && local < param) {

                    console.log(
                        "[GUIDED DEBUG] priorityEvaluator RESULT = BLOCKED",
                        "| Higher priority not displayed:",
                        local,
                        "| Current priority:",
                        param
                    );

                    console.log("---------- GUIDED DEBUG : priorityEvaluator END ------------");

                    return 'blocked';
                }
            }

            console.log("[GUIDED DEBUG] priorityEvaluator RESULT = ALLOWED");
            console.log("---------- GUIDED DEBUG : priorityEvaluator END ------------");

            return 'allowed';
        }

        console.log("[GUIDED DEBUG] priorityEvaluator param was empty/falsy:", param);
        console.log("---------- GUIDED DEBUG : priorityEvaluator END ------------");
    }
} else {

    console.log(
        "[GUIDED DEBUG] Existing window.priorityEvaluator already present:",
        window.priorityEvaluator
    );
}


function bannerController(param) {

    console.log("");
    console.log("============================================================");
    console.log("========== GUIDED DEBUG : bannerController START ===========");
    console.log("[GUIDED DEBUG] Time:", new Date().toISOString());
    console.log("[GUIDED DEBUG] Current priority param:", param);

    var bannerDisplayNos = sessionStorage.getItem('bannerDisplayNos') ?
        JSON.parse(sessionStorage.getItem('bannerDisplayNos')) :
        [];

    console.log("[GUIDED DEBUG] bannerDisplayNos at START:", bannerDisplayNos);

    var uniqueExps = window.uniqueExtractor(window.activityPriorityExp);

    console.log("[GUIDED DEBUG] activityPriorityExp:", window.activityPriorityExp);
    console.log("[GUIDED DEBUG] uniqueExps:", uniqueExps);
    console.log("[GUIDED DEBUG] uniqueExps.length:", uniqueExps.length);
    console.log(
        "[GUIDED DEBUG] bannerDisplayNos.length:",
        bannerDisplayNos.length
    );

    console.log(
        "[GUIDED DEBUG] Rotation completion comparison:",
        bannerDisplayNos.length,
        "==",
        uniqueExps.length,
        "→",
        bannerDisplayNos.length == uniqueExps.length
    );

    if (bannerDisplayNos.length == uniqueExps.length) {

        console.log(
            "[GUIDED DEBUG] ALL OUR BANNER PRIORITIES ARE CONSIDERED COMPLETE"
        );

        var otherBannerCount = sessionStorage.getItem('otherBannerCount') ?
            Number(sessionStorage.getItem('otherBannerCount')) :
            0;

        console.log(
            "[GUIDED DEBUG] otherBannerCount at entry:",
            otherBannerCount
        );

        console.log(
            "[GUIDED DEBUG] Calling otherActivitiesfinder to determine other eligible banners"
        );

        if (window.otherActivitiesfinder() > 0) {

            console.log(
                "[GUIDED DEBUG] At least one OTHER activity is eligible"
            );

            var eligibleActCount = window.otherActivitiesfinder();

            console.log(
                "[GUIDED DEBUG] eligibleActCount:",
                eligibleActCount
            );

            console.log(
                "[GUIDED DEBUG] uniqueExps.length:",
                uniqueExps.length
            );

            console.log(
                "[GUIDED DEBUG] Calculated reset threshold = eligibleActCount * uniqueExps.length:",
                eligibleActCount,
                "*",
                uniqueExps.length,
                "=",
                (eligibleActCount * uniqueExps.length)
            );

            console.log(
                "[GUIDED DEBUG] Current threshold comparison:",
                otherBannerCount,
                "==",
                (eligibleActCount * uniqueExps.length),
                "→",
                otherBannerCount == (eligibleActCount * uniqueExps.length)
            );

            if (otherBannerCount == (eligibleActCount * (uniqueExps.length))) {

                console.log(
                    "[GUIDED DEBUG] RESET THRESHOLD REACHED"
                );

                //Logic to rotate the process
                bannerDisplayNos = [];

                console.log(
                    "[GUIDED DEBUG] Local bannerDisplayNos reset:",
                    bannerDisplayNos
                );

                sessionStorage.removeItem('bannerDisplayNos');

                console.log(
                    "[GUIDED DEBUG] sessionStorage bannerDisplayNos REMOVED"
                );

                sessionStorage.removeItem('otherBannerCount');

                console.log(
                    "[GUIDED DEBUG] sessionStorage otherBannerCount REMOVED"
                );
            } else {

                console.log(
                    "[GUIDED DEBUG] External banner slot being allocated"
                );

                otherBannerCount = otherBannerCount + 1;

                console.log(
                    "[GUIDED DEBUG] otherBannerCount incremented to:",
                    otherBannerCount
                );

                sessionStorage.setItem('otherBannerCount', otherBannerCount);

                console.log(
                    "[GUIDED DEBUG] otherBannerCount saved:",
                    sessionStorage.getItem('otherBannerCount')
                );

                $('#adobeBannerOffer').show();

                console.log(
                    "[GUIDED DEBUG] #adobeBannerOffer SHOW called for external banner opportunity"
                );
            }
        } else {

            console.log(
                "[GUIDED DEBUG] NO other activities eligible"
            );

            //Logic to rotate the process
            bannerDisplayNos = [];

            console.log(
                "[GUIDED DEBUG] Local bannerDisplayNos reset:",
                bannerDisplayNos
            );

            sessionStorage.removeItem('bannerDisplayNos');

            console.log(
                "[GUIDED DEBUG] sessionStorage bannerDisplayNos REMOVED"
            );
        }
    }

    console.log(
        "[GUIDED DEBUG] bannerDisplayNos before final decision:",
        bannerDisplayNos
    );

    if (bannerDisplayNos.length > 0) {

        console.log(
            "[GUIDED DEBUG] Current priority already present?:",
            bannerDisplayNos.indexOf(param) > -1
        );

        if (bannerDisplayNos.indexOf(param) > -1) {

            console.log(
                "[GUIDED DEBUG] bannerController RESULT = BLOCKED"
            );

            console.log("=========== GUIDED DEBUG : bannerController END ============");
            console.log("============================================================");
            console.log("");

            return 'blocked';
        } else {

            console.log(
                "[GUIDED DEBUG] bannerController RESULT = ALLOWED"
            );

            console.log("=========== GUIDED DEBUG : bannerController END ============");
            console.log("============================================================");
            console.log("");

            return 'allowed';
        }
    } else {

        //First Time the user loads

        console.log(
            "[GUIDED DEBUG] bannerDisplayNos empty → First/new rotation"
        );

        console.log(
            "[GUIDED DEBUG] bannerController RESULT = ALLOWED"
        );

        console.log("=========== GUIDED DEBUG : bannerController END ============");
        console.log("============================================================");
        console.log("");

        return 'allowed';
    }
}


if (typeof window.bannerRotator != 'function') {

    console.log("[GUIDED DEBUG] Creating window.bannerRotator");

    window.bannerRotator = function bannerRotator(param) {

        console.log("---------- GUIDED DEBUG : bannerRotator START ----------");
        console.log("[GUIDED DEBUG] Priority being stored:", param);
        console.log(
            "[GUIDED DEBUG] bannerDisplayNos before:",
            sessionStorage.getItem('bannerDisplayNos')
        );

        var bannerDisplayNos = sessionStorage.getItem('bannerDisplayNos') ?
            JSON.parse(sessionStorage.getItem('bannerDisplayNos')) :
            [];

        console.log(
            "[GUIDED DEBUG] Parsed bannerDisplayNos before push:",
            bannerDisplayNos
        );

        bannerDisplayNos.push(param);

        console.log(
            "[GUIDED DEBUG] bannerDisplayNos after push:",
            bannerDisplayNos
        );

        sessionStorage.setItem('bannerDisplayNos', JSON.stringify(bannerDisplayNos));

        console.log(
            "[GUIDED DEBUG] bannerDisplayNos saved:",
            sessionStorage.getItem('bannerDisplayNos')
        );

        console.log("---------- GUIDED DEBUG : bannerRotator END ------------");
    }
} else {

    console.log(
        "[GUIDED DEBUG] Existing window.bannerRotator already present:",
        window.bannerRotator
    );
}


function guidedExecutor() {

    console.log("");
    console.log("---------- GUIDED DEBUG : guidedExecutor START ----------");
    console.log("[GUIDED DEBUG] Time:", new Date().toISOString());
    console.log(
        "[GUIDED DEBUG] #adobeBannerOffer count:",
        document.querySelectorAll('#adobeBannerOffer').length
    );

    //Validating the Main Container
    if (document.querySelectorAll('#adobeBannerOffer').length > 0) {

        console.log("[GUIDED DEBUG] Main banner container FOUND");

        //Hiding the display area
        document.querySelector('#adobeBannerOffer').style.display = 'none';

        console.log(
            "[GUIDED DEBUG] #adobeBannerOffer hidden before 3-second evaluation"
        );

        console.log(
            "[GUIDED DEBUG] State before timeout:", {
                guidedPriority: guidedPriority,
                activityPriorityExp: window.activityPriorityExp,
                bannerDisplayNos: sessionStorage.getItem('bannerDisplayNos'),
                otherBannerCount: sessionStorage.getItem('otherBannerCount'),
                activityNames: _satellite.getVar('activityNames')
            }
        );

        setTimeout(function() {

            console.log("");
            console.log("******** GUIDED DEBUG : 3 SECOND TIMEOUT FIRED ********");
            console.log("[GUIDED DEBUG] Time:", new Date().toISOString());
            console.log("[GUIDED DEBUG] guidedPriority:", guidedPriority);
            console.log(
                "[GUIDED DEBUG] activityPriorityExp:",
                window.activityPriorityExp
            );
            console.log(
                "[GUIDED DEBUG] bannerDisplayNos before controller:",
                sessionStorage.getItem('bannerDisplayNos')
            );
            console.log(
                "[GUIDED DEBUG] otherBannerCount before controller:",
                sessionStorage.getItem('otherBannerCount')
            );
            console.log(
                "[GUIDED DEBUG] activityNames:",
                _satellite.getVar('activityNames')
            );

            console.log('Testing Specific Inside Timeout - Guided');

            console.log(
                "[GUIDED DEBUG] Calling bannerController with:",
                guidedPriority
            );

            if (window.bannerController(guidedPriority) == 'allowed') {

                console.log(
                    "[GUIDED DEBUG] bannerController returned ALLOWED"
                );

                console.log('Testing Specific Inside banner controller - Guided');

                console.log(
                    "[GUIDED DEBUG] Calling priorityEvaluator with:",
                    guidedPriority
                );

                if (window.priorityEvaluator(guidedPriority) == 'allowed') {

                    console.log(
                        "[GUIDED DEBUG] priorityEvaluator returned ALLOWED"
                    );

                    console.log('Testing Specific Inside priorityEvaluator - Guided');

                    console.log(
                        "[GUIDED DEBUG] Scheduling bannerRotator in 1000ms for priority:",
                        guidedPriority
                    );

                    setTimeout(function() {

                        console.log(
                            "[GUIDED DEBUG] 1-second bannerRotator timeout fired"
                        );

                        window.bannerRotator(guidedPriority);

                    }, 1000);

                    console.log(
                        "[GUIDED DEBUG] Calling getRandomBannerguided()"
                    );

                    getRandomBannerguided();

                    console.log(
                        "[GUIDED DEBUG] getRandomBannerguided() completed"
                    );

                    document.querySelector('#adobeBannerOffer').style.display = 'block';

                    console.log(
                        "[GUIDED DEBUG] #adobeBannerOffer display set to BLOCK"
                    );
                } else {

                    console.log(
                        "[GUIDED DEBUG] priorityEvaluator returned BLOCKED"
                    );
                }
            } else {

                console.log(
                    "[GUIDED DEBUG] bannerController returned BLOCKED"
                );
            }

            console.log(
                "[GUIDED DEBUG] State after decision:", {
                    bannerDisplayNos: sessionStorage.getItem('bannerDisplayNos'),
                    otherBannerCount: sessionStorage.getItem('otherBannerCount'),
                    display: document.querySelector('#adobeBannerOffer') ?
                        document.querySelector('#adobeBannerOffer').style.display :
                        'container missing'
                }
            );

            console.log("******** GUIDED DEBUG : 3 SECOND FLOW END ********");
            console.log("");

        }, 3000);
    } else {

        console.log(
            "[GUIDED DEBUG] #adobeBannerOffer NOT FOUND. Retrying in 500ms"
        );

        //Recurse till Container is available
        setTimeout(function() {

            console.log(
                "[GUIDED DEBUG] 500ms retry fired - calling guidedExecutor again"
            );

            guidedExecutor();

        }, 500);
    }

    console.log("---------- GUIDED DEBUG : guidedExecutor END ------------");
}


console.log("[GUIDED DEBUG] Initial guidedExecutor() call");

guidedExecutor();

<
/script>

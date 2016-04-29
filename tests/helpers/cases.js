import emberQUnit from 'ember-qunit';

function cases(testCases) {
    let currentCases = testCases;

    const createTest = function(methodName, title, expected, callback, parameters) {
        emberQUnit[methodName](
            title,
            function(assert) {
                return callback.call(this, parameters, assert);
            }
        );
    };

    const iterateTestCases = function(methodName, title, expected, callback) {
        if (!currentCases || currentCases.length === 0) {
            // setup test which will always fail
            emberQUnit.test(title, function(assert) {
                assert.ok(false, 'No test cases are provided');
            });
            return;
        }

        if (!callback) {
            callback = expected;
            expected = null;
        }

        for (let i = 0; i < currentCases.length; ++i) {
            const parameters = currentCases[i];

            let testCaseTitle = title;
            if (parameters.title) {
                testCaseTitle += '[' + parameters.title + ']';
            }

            createTest(methodName, testCaseTitle, expected, callback, parameters);
        }
    };

    const getLength = function(arr) {
        return arr ? arr.length : 0;
    };

    const getItem = function(arr, idx) {
        return arr ? arr[idx] : undefined;
    };

    const mix = function(testCase, mixData) {
        if (testCase && mixData) {
            const result = clone(testCase);
            for (const p in mixData) {
                if (p !== 'title') {
                    if (!(p in result)) { //eslint-disable-line
                        result[p] = mixData[p];
                    }
                } else {
                    result[p] = [result[p], mixData[p]].join('');
                }
            }
            return result;
        } else if (testCase) {
            return testCase;
        } else if (mixData) {
            return mixData;
        }

        // return null or undefined whatever testCase is
        return testCase;
    };

    const clone = function(testCase) {
        const result = {};
        for (const p in testCase) { //eslint-disable-line
            result[p] = testCase[p];
        }
        return result;
    };

    return {
        sequential(addData) {
            const casesLength = getLength(currentCases);
            const addDataLength = getLength(addData);
            const length = casesLength > addDataLength ? casesLength : addDataLength;

            const newCases = [];
            for (let i = 0; i < length; ++i) {
                const currentCaseI = getItem(currentCases, i);
                const dataI = getItem(addData, i);
                const newCase = mix(currentCaseI, dataI);

                if (newCase) {
                    newCases.push(newCase);
                }
            }
            currentCases = newCases;

            return this;
        },

        combinatorial(mixData) {
            const current = (currentCases && currentCases.length > 0) ? currentCases : [null];
            mixData = (mixData && mixData.length > 0) ? mixData : [null];
            const currentLength = current.length;
            const mixDataLength = mixData.length;

            const newCases = [];
            for (let i = 0; i < currentLength; ++i) {
                for (let j = 0; j < mixDataLength; ++j) {
                    const currentCaseI = current[i];
                    const dataJ = mixData[j];
                    const newCase = mix(currentCaseI, dataJ);

                    if (newCase) {
                        newCases.push(newCase);
                    }
                }
            }
            currentCases = newCases;

            return this;
        },

        test(title, expected, callback) {
            iterateTestCases('test', title, expected, callback);
            return this;
        }
    };
}

export default cases;

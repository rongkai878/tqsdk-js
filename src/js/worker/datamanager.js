const DM = (function () {

    function mergeObject(target, source) {
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        target[key] = value;
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        mergeObject(target[key], value);
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        mergeObject(target[key], value);
                    }
                    break;

                case 'string':
                    if (value === 'NaN') {
                        target[key] = NaN;
                    } else {
                        target[key] = value;
                    }
                    break;

                case 'boolean':
                case 'number':
                    target[key] = value;
                    break;

                case 'undefined':
                    break;
            }
        }
    }

    function setInvalid(diff) {
        if (diff.klines) {
            for (let key in diff.klines) {
                for (let dur in diff.klines[key]) {
                    let perfix = key + '.' + dur;

                    // 更新 path 对应的 first_id, last_id
                    if (!DM.paths.has(perfix)) {
                        DM.paths.set(perfix, { firstId: Infinity, lastId: -Infinity });
                    }

                    let { firstId, lastId } = DM.paths.get(perfix);
                    for (let k in diff.klines[key][dur].data) {
                        firstId = firstId < parseInt(k) ? firstId : parseInt(k);
                        lastId = lastId > parseInt(k) ? lastId : parseInt(k);
                    }

                    DM.paths.get(perfix).firstId = firstId;
                    DM.paths.get(perfix).lastId = lastId;
                }
            }
        }
    }

    function updateData(diff) {
        // 将 diff 中所有数据更新到 datas 中
        mergeObject(DM.datas, diff);

        // 将 diff 中所有数据涉及的 instance 设置 invalid 标志
        // 只检查了 klines[ins_id][dur_id] 里的数据
        setInvalid(diff);
    }

    function getTdataObj(insId, instanceId) {
        var path = insId + '.0';
        G_INSTANCES[instanceId].addRelationship(path);
        try {
            return DM.datas.ticks[insId].data;
        } catch (e) {
            return undefined;
        }
    }

    function getKdataObj(insId, durId, instanceId) {
        try {
            return DM.datas.klines[insId][durId].data;
        } catch (e) {
            return undefined;
        }
    }

    function clearData() {
        // 清空数据
        for (var k in DM.datas) {
            delete DM.datas[k];
        }
        DM.paths.clear();
    }

    function getDataRange(path) {
        var res = { firstId: Infinity, lastId: -Infinity };
        if (DM.paths.has(path)) {
            res = DM.paths.get(path);
        }

        return res;
    }

    function getData(path, separator) {
        try {
            var d = DM.datas;
            var pathList = null;
            if (path instanceof Array) pathList = path;
            else if (typeof path === 'string') pathList = path.split(separator ? separator : ' ');
            else return undefined;
            for (var i = 0; i < pathList.length; i++) d = d[pathList[i]];
            return d;
        } catch (e) {
            return undefined;
        }
    }

    return {
        datas: {},
        paths: new Map(),
        get_tdata_obj: getTdataObj,
        get_kdata_obj: getKdataObj,
        get_data_range: getDataRange,
        // 更新数据
        update_data: updateData,
        // 清空全部数据
        clear_data: clearData,
        get_data: getData,
    };
}());
import Taro from '@tarojs/taro';

const log = (() => {
    const logger = Taro.getRealtimeLogManager ? Taro.getRealtimeLogManager() : null;

    return {
        debug: (...args: any[]) => {
            if (!logger) return;
            logger.debug(...args);
        },
        info: (...args: any[]) => {
            if (!logger) return;
            logger.info(...args);
        },
        warn: (...args: any[]) => {
            if (!logger) return;
            logger.warn(...args);
        },
        error: (...args: any[]) => {
            if (!logger) return;
            logger.error(...args);
        },
        setFilterMsg: (msg: string) => {
            if (!logger || !logger.setFilterMsg) return;
            logger.setFilterMsg(msg);
        },
        addFilterMsg: (msg: string) => {
            if (!logger || !logger.addFilterMsg) return;
            logger.addFilterMsg(msg);
        }
    };
})();

export default log;

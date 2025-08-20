const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env }) => {
            // Add bundle analyzer plugin when ANALYZE=true
            if (process.env.ANALYZE === 'true') {
                webpackConfig.plugins.push(
                    new BundleAnalyzerPlugin({
                        analyzerMode: 'static',
                        openAnalyzer: false,
                        reportFilename: 'bundle-report.html',
                        generateStatsFile: true,
                        statsFilename: 'bundle-stats.json',
                    })
                );
            }

            return webpackConfig;
        },
    },
};

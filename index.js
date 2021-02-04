'use strict';

const core = require('@actions/core');
const webExt = require('web-ext');
const qs = require('querystring');
const os = require('os');
const path = require('path');

function report(level, info, message) {
    const meta = qs.stringify(info, ',', '=', {
        encodeURIComponent: (str) => str
    });
    core.info(`::${level} ${meta}::${message}`);
}

function formatLocation(report) {
    return [
        report.file,
        report.line,
        report.column
    ].filter((exists) => !!exists)
        .join(':');
}

function formatMessage(report) {
    const verbose = core.getInput('verbose') || false;
    if(verbose) {
        return `${report.message} - ${report.description}`;
    }
    return report.message;
}

const source = core.getInput('extension-root') || '.';
webExt.cmd.lint({
    sourceDir: source,
    output: 'json'
},
{
    shouldExitProgram: false
})
    .then((lintResult) => {
        if(lintResult.errors.length > 0) {
            core.startGroup('Errors');
            for(const error of lintResult.errors) {
                if(error.file) {
                    report('error', {
                        file: path.join(source, error.file),
                        line: error.line,
                        col: error.column
                    }, formatMessage(error));
                }
                else {
                    core.error(formatMessage(error));
                }
            }
            core.endGroup();
        }
        if(lintResult.warnings.length) {
            core.startGroup('Warnings');
            for(const warning of lintResult.warnings) {
                if(warning.file) {
                    report('warning', {
                        file: path.join(source, warning.file),
                        line: warning.line,
                        col: warning.column
                    }, formatMessage(warning));
                }
                else {
                    core.warning(formatMessage(warning));
                }
            }
            core.endGroup();
        }
        if(lintResult.notices.length) {
            core.startGroup('Notices');
            for(const notice of lintResult.notices) {
                core.info(`${formatLocation(notice)} ${formatMessage(notice)}`);
            }
            core.endGroup();
        }
        if(lintResult.summary.errors > 0) {
            core.setFailed(`${lintResult.summary.errors} error(s) were reported by web-ext`);
        }
    })
    .catch((error) => core.setFailed(error.message));

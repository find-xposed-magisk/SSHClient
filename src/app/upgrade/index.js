/**
 * common data upgrade process
 * It will check current version in db and check version in package.json,
 * run every upgrade script one by one
 */

import { packInfo } from '../common/runtime-constants.js'
import { resolve, dirname } from 'path'
import fs from 'fs'
import log from '../common/log.js'
import compare from '../common/version-compare.js'
import { dbAction } from '../lib/db.js'
import _ from 'lodash'
import initData from './init-nedb.js'
import { updateDBVersion } from './version-upgrade.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { version: packVersion } = packInfo
const emptyVersion = '0.0.0'
const versionQuery = {
  _id: 'version'
}

async function getDBVersion () {
  const version = await dbAction('data', 'findOne', versionQuery)
    .then(doc => {
      return doc ? doc.value : emptyVersion
    })
    .catch(e => {
      log.error(e)
      return emptyVersion
    })
  return version
}

/**
 * get upgrade versions should be run as version upgrade
 */
export function parseUpgradeFile (f) {
  const m = /^v(\d+\.\d+\.\d+)\.js$/.exec(f)
  return m ? m[1] : null
}

export async function getUpgradeVersionList () {
  const version = await getDBVersion()
  let list = []
  try {
    list = fs.readdirSync(__dirname)
  } catch (e) {
    log.error('read upgrade dir fails', e)
    return []
  }
  return list.filter(f => {
    const vv = parseUpgradeFile(f)
    return vv && compare(vv, version) > 0 && compare(vv, packVersion) <= 0
  }).sort((a, b) => {
    return compare(parseUpgradeFile(a), parseUpgradeFile(b))
  })
}

async function versionShouldUpgrade () {
  const dbVersion = await getDBVersion()
  log.info('database version:', dbVersion)
  return compare(dbVersion, packVersion) < 0
}

export async function checkDbUpgrade () {
  const shouldUpgradeVersion = await versionShouldUpgrade()
  if (!shouldUpgradeVersion) {
    return false
  }
  const dbVersion = await getDBVersion()
  log.info('dbVersion', dbVersion)
  if (dbVersion === emptyVersion) {
    await initData()
    await updateDBVersion(packVersion)
    return false
  }
  const list = await getUpgradeVersionList()
  if (_.isEmpty(list)) {
    await updateDBVersion(packVersion)
    return false
  }
  return {
    dbVersion,
    packVersion
  }
}

export async function doUpgrade () {
  const list = await getUpgradeVersionList()
  log.info('Upgrading...')
  for (const v of list) {
    const p = resolve(__dirname, v)
    try {
      const mod = await import(p)
      const run = mod.default
      await run()
    } catch (e) {
      // A single broken migration script must never brick app startup:
      // log it, stamp its version so it is not retried forever, continue
      log.error(`Upgrade script ${v} fails, skip it`, e)
      const vv = parseUpgradeFile(v)
      if (vv) {
        await updateDBVersion(vv)
      }
    }
  }
  log.info('Upgrade end')
}

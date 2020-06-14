/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  var response = {type: 'NONE'};
  return response;
}

/**
 * Returns the user configurable options for the connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  
  config
    .newTextInput()
    .setAllowOverride(false)
    .setId('costBreakdownTableID')
    .setName('Enter the fully-qualified name of the cost breakdown BigQuery table that you created following the steps in our documentation')
    .setHelpText('A full-qualified BigQuery dataset name should be in format ${PROJECT_ID}.${DATASET_ID}.{TABLE_ID}')
    .setPlaceholder('${PROJECT_ID}.${DATASET_ID}.{TABLE_ID}');

  // This forces a date range object to be provided for `getData()` requests.
  // https://developers.google.com/apps-script/reference/data-studio/config#setDateRangeRequired(Boolean)
  config.setDateRangeRequired(true);

  return config.build();
}

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  gkeUsageMetering.validateConfig(cc, request.configParams);

  return gkeUsageMetering.getSchema(request);
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  let costBreakdownTableID = request.configParams.costBreakdownTableID
  let billingProjectID = costBreakdownTableID.split('.')[0];
  let response = {
    authConfig: {
      accessToken: authToken
    },
    dataConfig: {
      type: 'BIGQUERY',
      bigQueryConnectorConfig: {
        billingProjectId: billingProjectID,
        query: gkeUsageMetering.generateSQLQuery(
            costBreakdownTableID),
        useStandardSql: true
      }
    }
  };
  return response;
}

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
  return false;
}



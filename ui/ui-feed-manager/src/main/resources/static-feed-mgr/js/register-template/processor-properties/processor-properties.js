/*-
 * #%L
 * thinkbig-ui-feed-manager
 * %%
 * Copyright (C) 2017 ThinkBig Analytics
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */
(function () {

    var directive = function () {
        return {
            restrict: "EA",
            bindToController: {
                stepIndex: '@',
                cardTitle:'@',
                processorPropertiesFieldName:'@'
            },
            scope: {},
            controllerAs: 'vm',
            templateUrl: 'js/register-template/processor-properties/processor-properties.html',
            controller: "RegisterProcessorPropertiesController",
            link: function ($scope, element, attrs, controller) {

            }

        };
    }

    var controller =  function($scope, $element,$http,$q,$mdToast,$location,$window,RestUrlService, RegisterTemplateService,FeedInputProcessorOptionsFactory, BroadcastService,StepperService,Utils) {

        var self = this;
        this.model = RegisterTemplateService.model;
        this.isValid = true;
        this.expressionProperties =  RegisterTemplateService.propertyList;



        //BroadcastService.subscribe($scope,StepperService.ACTIVE_STEP_EVENT,onActiveStep)

        //Filter attrs
        this.stepNumber = parseInt(this.stepIndex)+1
        this.propertiesThatNeedAttention = false;
        this.showOnlySelected = false;
        this.filterString = null;

        self.propertyRenderTypes = [];
        self.processors = [];
        self.visiblePropertyCount = 0;


        self.allProperties = [];



        function transformPropertiesToArray() {
            var propertiesKey = self.processorPropertiesFieldName+"Properties";
            var processorsKey = self.processorPropertiesFieldName+"Processors";
            self.allProperties = self.model[propertiesKey]
            self.processors = self.model[processorsKey];
            if(self.showOnlySelected){
                showSelected();
            }
        }

        function showSelected() {
            var selectedProperties = [];
            angular.forEach(self.allProperties,function(property) {
                if(property.selected) {
                    selectedProperties.push(property);
                }
            });

            //sort them by processor name and property key
            var propertiesAndProcessors = RegisterTemplateService.sortPropertiesForDisplay(selectedProperties);
            self.allProperties = propertiesAndProcessors.properties;
            self.processors = propertiesAndProcessors.processors;
        }

        this.onShowOnlySelected = function(){
            transformPropertiesToArray();
        }
        this.onRenderTypeChange = function(property){
            if(property.renderType == 'select' && (property.propertyDescriptor.allowableValues == undefined || property.propertyDescriptor.allowableValues == null || property.propertyDescriptor.allowableValues.length == 0)) {
                if(property.selectOptions == undefined){
                    property.selectOptions = [];
                }
                property.renderOptions['selectCustom'] = 'true';
            }
            else {
                property.renderOptions['selectCustom'] ='false';
                property.selectOptions = undefined;
            }
        }

        this.customSelectOptionChanged = function(property){
            var str = JSON.stringify(property.selectOptions);
            property.renderOptions['selectOptions'] = str;

        }


        function initializeRenderTypes() {
            angular.forEach(RegisterTemplateService.codemirrorTypes,function(label,type){
                self.propertyRenderTypes.push({type:type,label:label,codemirror:true});
            });
        }

        $scope.$watch(function() {
            return RegisterTemplateService.codemirrorTypes;
        },function(newVal) {
            initializeRenderTypes();
        })





      $scope.$watchCollection(function(){
          return self.model[self.processorPropertiesFieldName]
      }, function(){
          transformPropertiesToArray();
        //  self.processors = filterProcessors(self.propertiesThatNeedAttention, self.showOnlySelected);
        //  countVisibleProperties();
      })

       // $anchorScroll.yOffset = 200;
         this.searchExpressionProperties = function(term) {
            var propertyList = [];

            angular.forEach(RegisterTemplateService.propertyList,function(property,i) {
                if(property.key.toUpperCase().indexOf(term.toUpperCase()) >=0) {
                    propertyList.push(property)
                }
            });
            self.expressionProperties = propertyList;
            return $q.when(propertyList);
        };

        this.getExpressionPropertyTextRaw = function(item) {
          return '${'+item.key+'}';
        };

        this.inputProcessorSelectionInvalid = function() {
          var selectedList =  _.filter(self.model.inputProcessors,function(processor){
                return processor.selected;
            });
            if(selectedList == null || selectedList.length == 0){
                self.isValid = false;
                return true;
            }
            else {
                self.isValid = true;
                return false;
            }

        }

        this.minProcessorItems = function(){
            var windowHeight = angular.element($window).height();
            var newHeight = windowHeight - 450;
            var processorHeight = 48;
            var minItems = Math.round(newHeight/processorHeight);
            return minItems;
        }


        this.scrollToProcessor = function(processor){
            var topIndex = processor.topIndex;
            self.topIndex = topIndex;
        }


    };


    angular.module(MODULE_FEED_MGR).controller('RegisterProcessorPropertiesController', controller);

    angular.module(MODULE_FEED_MGR)
        .directive('thinkbigRegisterProcessorProperties', directive);

})();

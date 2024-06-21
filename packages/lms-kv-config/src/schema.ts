/**
 * This file is divided into 4 sections:
 *
 * 1. globalConfigSchematics: The pool for all config keys and their types
 * 2. Functionality scope definitions: i.e. what config keys are available in what functionality
 *    scope. An example functionality scope is llmPrediction.
 * 3. Utility types that can be used to work with types of schema.
 */

import {
  type InferConfigSchemaKeys,
  type InferConfigSchemaMap,
  type InferValueTypeKeys,
  type InferValueTypeMap,
  KVConfigSchematicsBuilder,
} from "./KVConfig";
import { kvValueTypesLibrary } from "./valueTypes";

// ---------------------------
//  1. globalConfigSchematics
// ---------------------------

export const globalConfigSchematics = new KVConfigSchematicsBuilder(kvValueTypesLibrary)
  .scope("llm.prediction", builder =>
    builder
      .field(
        "temperature",
        "numeric",
        { min: 0, max: 1, slider: { min: 0, max: 1, step: 0.01 }, shortHand: "temp" },
        0.8,
      )
      .field("contextOverflowPolicy", "contextOverflowPolicy", undefined, "stopAtLimit")
      .field(
        "maxPredictedTokens",
        "checkboxNumeric",
        { min: 1, int: true },
        { checked: false, value: 100 },
      )
      .field("stopStrings", "stringArray", {}, [])
      .field("structured", "llamaStructuredOutput", undefined, {
        type: "none",
      })
      .field("promptTemplate", "llmPromptTemplate", undefined, {
        type: "legacy",
        inputPrefix: "",
        inputSuffix: "",
        prePromptPrefix: "",
        prePromptSuffix: "",
      })
      .field("systemPrompt", "string", {}, "")
      .scope("llama", builder =>
        builder
          .field("topKSampling", "numeric", { min: -1, max: 500, int: true }, 40)
          .field("repeatPenalty", "checkboxNumeric", { min: -1 }, { checked: true, value: 1.1 })
          .field(
            "minPSampling",
            "checkboxNumeric",
            { min: 0, max: 1, slider: { min: 0, max: 1, step: 0.01 } },
            { checked: true, value: 0.05 },
          )
          .field(
            "topPSampling",
            "checkboxNumeric",
            { min: 0, max: 1, slider: { min: 0, max: 1, step: 0.01 } },
            { checked: true, value: 0.95 },
          )
          .field("cpuThreads", "numeric", { min: 1, int: true }, 4),
      ),
  )
  .scope("llm.load", builder =>
    builder
      .field("contextLength", "numeric", { min: 1, int: true }, 2048)
      .field("numExperts", "numeric", { min: 0, int: true }, 0)
      .scope("llama", builder =>
        builder
          .field("evalBatchSize", "numeric", { min: 1, int: true }, 512)
          .field("gpuOffload", "llamaGpuOffload", undefined, {
            ratio: "auto",
            mainGpu: 0,
            tensorSplit: [0],
          })
          .field("flashAttention", "boolean", undefined, false)
          .field("ropeFrequencyBase", "numeric", {}, 0)
          .field("ropeFrequencyScale", "numeric", {}, 0)
          .field("keepModelInMemory", "boolean", undefined, true)
          .field("seed", "numeric", { int: true }, 0) // asd
          .field("useFp16ForKVCache", "boolean", undefined, true)
          .field("tryMmap", "boolean", undefined, true),
      ),
  )
  .build();

// ------------------------------------
//  2. Functionality scope definitions
// ------------------------------------

const llmPrediction = globalConfigSchematics.scoped("llm.prediction");

export const llmSharedPredictionConfigSchematics = llmPrediction.sliced(
  "temperature",
  "contextOverflowPolicy",
  "maxPredictedTokens",
  "stopStrings",
  "structured",
  "promptTemplate",
  "systemPrompt",
);

export const llmLlamaPredictionConfigSchematics = llmSharedPredictionConfigSchematics.union(
  llmPrediction.sliced("llama.*"),
);

const llmLoad = globalConfigSchematics.scoped("llm.load");

export const llmLlamaLoadConfigSchematics = llmLoad.sliced("llama.*", "contextLength");

const llmLlamaMoeAdditionalLoadConfigSchematics = llmLoad.sliced("numExperts");

export const llmLlamaMoeLoadConfigSchematics = llmLlamaLoadConfigSchematics.union(
  llmLlamaMoeAdditionalLoadConfigSchematics,
);

export const emptyConfigSchematics = new KVConfigSchematicsBuilder(kvValueTypesLibrary).build();

// ------------------
//  3. Utility types
// ------------------

export type GlobalKVValueTypeMap = InferValueTypeMap<typeof kvValueTypesLibrary>;
/**
 * All the value type keys
 */
export type GlobalKVValueTypeKeys = InferValueTypeKeys<typeof kvValueTypesLibrary>;
/**
 * Given a value type key, look up the typescript type of the value
 */
export type GlobalKVValueTypeValueTypeForKey<TKey extends GlobalKVValueTypeKeys> =
  GlobalKVValueTypeMap[TKey]["value"];
/**
 * Given a value type key, look up the typescript type of the param
 */
export type GlobalKVValueTypeParamTypeForKey<TKey extends GlobalKVValueTypeKeys> =
  GlobalKVValueTypeMap[TKey]["param"];

export type GlobalConfigSchemaMap = InferConfigSchemaMap<typeof globalConfigSchematics>;
/**
 * All the config keys
 */
export type GlobalConfigSchemaKeys = InferConfigSchemaKeys<typeof globalConfigSchematics>;
/**
 * Given a config key, look up the typescript type of the value
 */
export type GlobalConfigSchemaTypeForKey<TKey extends GlobalConfigSchemaKeys> =
  GlobalConfigSchemaMap[TKey]["type"];
/**
 * Given a config key, look up the value type key
 */
export type GlobalConfigSchemaValueTypeKeyForKey<TKey extends GlobalConfigSchemaKeys> =
  GlobalConfigSchemaMap[TKey]["valueTypeKey"];

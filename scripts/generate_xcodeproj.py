import os

def make_id(prefix, index):
    # prefix is 2 chars, index is formatted as 22 hex digits -> total 24 chars
    return f"{prefix}{index:022X}"

def generate_xcodeproj():
    xcodeproj_dir = "HaniVoca.xcodeproj"
    workspace_dir = os.path.join(xcodeproj_dir, "project.xcworkspace")
    
    os.makedirs(xcodeproj_dir, exist_ok=True)
    os.makedirs(workspace_dir, exist_ok=True)
    
    # Write workspace contents data
    workspace_data = """<?xml version="1.0" encoding="UTF-8"?>
<Workspace
   version = "1.0">
   <FileRef
      location = "self:">
   </FileRef>
</Workspace>
"""
    with open(os.path.join(workspace_dir, "contents.xcworkspacedata"), "w", encoding="utf-8") as f:
        f.write(workspace_data)
        
    # File lists
    sources = [
        "HaniVocaApp.swift",
        "Views/ContentView.swift",
        "Views/MainTabView.swift",
        "Views/SidebarView.swift",
        "Views/TopicListView.swift",
        "Views/WordListView.swift",
        "Views/WordDetailView.swift",
        "Views/CustomWordsView.swift",
        "Views/PhrasesView.swift",
        "Views/FlashcardView.swift",
        "Views/StatisticsView.swift",
        "Views/TestView.swift",
        "Views/DictionaryView.swift",
        "Views/ReadingListView.swift",
        "Views/ReadingDetailView.swift",
        "Views/ReadingQuizView.swift",
        "Models/Word.swift",
        "Models/Phrase.swift",
        "Models/VocabularyStore.swift",
        "Models/SwiftDataModels.swift",
        "Models/ReadingModel.swift",
        "Utils/SpeechSynthesizer.swift",
        "Utils/DictionaryLookupService.swift",
        "Utils/DictionaryDatabase.swift",
        "Utils/Color+Extensions.swift",
        "Utils/DatabaseSeedingService.swift",
        "Utils/SM2SpacedRepetition.swift",
        "Utils/DocumentTransferHelper.swift",
        "Utils/SpeechRecognizerManager.swift"
    ]
    
    resources = [
        "Resources/words.json",
        "Resources/phrases.json",
        "Resources/tudien.db",
        "Resources/readings.json",
        "Resources/Assets.xcassets"
    ]

    # Generate PBXBuildFile and PBXFileReference sections dynamically
    pbx_build_files = []
    pbx_file_refs = []
    
    # We will map each file to a unique index
    # Sources map: index 1 to len(sources)
    # Resources map: index 1 to len(resources)
    
    for i, src in enumerate(sources):
        fid = make_id("F1", i + 1)
        bid = make_id("F2", i + 1)
        name = os.path.basename(src)
        pbx_build_files.append(f"\t\t{bid} /* {name} in Sources */ = {{isa = PBXBuildFile; fileRef = {fid} /* {name} */; }};")
        pbx_file_refs.append(f"\t\t{fid} /* {name} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = \"{src}\"; sourceTree = \"<group>\"; }};")
        
    for i, res in enumerate(resources):
        fid = make_id("R1", i + 1)
        bid = make_id("R2", i + 1)
        name = os.path.basename(res)
        pbx_build_files.append(f"\t\t{bid} /* {name} in Resources */ = {{isa = PBXBuildFile; fileRef = {fid} /* {name} */; }};")
        ftype = "folder.assetcatalog" if res.endswith(".xcassets") else "text.json"
        pbx_file_refs.append(f"\t\t{fid} /* {name} */ = {{isa = PBXFileReference; lastKnownFileType = {ftype}; path = \"{res}\"; sourceTree = \"<group>\"; }};")

    build_files_str = "\n".join(pbx_build_files)
    file_refs_str = "\n".join(pbx_file_refs)
    
    # Group children configurations
    views_children = []
    models_children = []
    utils_children = []
    resources_children = []
    
    for i, src in enumerate(sources):
        fid = make_id("F1", i + 1)
        name = os.path.basename(src)
        if src.startswith("Views/"):
            views_children.append(f"\t\t\t\t{fid} /* {name} */,")
        elif src.startswith("Models/"):
            models_children.append(f"\t\t\t\t{fid} /* {name} */,")
        elif src.startswith("Utils/"):
            utils_children.append(f"\t\t\t\t{fid} /* {name} */,")
            
    for i, res in enumerate(resources):
        fid = make_id("R1", i + 1)
        name = os.path.basename(res)
        resources_children.append(f"\t\t\t\t{fid} /* {name} */,")

    views_children_str = "\n".join(views_children)
    models_children_str = "\n".join(models_children)
    utils_children_str = "\n".join(utils_children)
    resources_children_str = "\n".join(resources_children)

    # Sources build phase children
    sources_build_files = []
    for i, src in enumerate(sources):
        bid = make_id("F2", i + 1)
        name = os.path.basename(src)
        sources_build_files.append(f"\t\t\t\t{bid} /* {name} in Sources */,")
    sources_build_files_str = "\n".join(sources_build_files)

    # Resources build phase children
    resources_build_files = []
    for i, res in enumerate(resources):
        bid = make_id("R2", i + 1)
        name = os.path.basename(res)
        resources_build_files.append(f"\t\t\t\t{bid} /* {name} in Resources */,")
    resources_build_files_str = "\n".join(resources_build_files)

    # Fixed IDs for project structures (all strictly 24 chars)
    target_id = make_id("F7", 1)
    project_id = make_id("F9", 1)
    product_ref = make_id("P1", 1)
    
    main_group_id = make_id("F6", 100)
    app_group_id = make_id("F6", 101)
    views_group_id = make_id("F6", 102)
    models_group_id = make_id("F6", 103)
    utils_group_id = make_id("F6", 104)
    resources_group_id = make_id("F6", 105)
    products_group_id = make_id("F6", 109)
    
    sources_phase_id = make_id("F3", 1)
    frameworks_phase_id = make_id("F5", 1)
    resources_phase_id = make_id("F4", 1)
    
    target_config_list = make_id("F8", 1)
    project_config_list = make_id("F8", 2)
    
    target_debug_config = make_id("F8", 11)
    target_release_config = make_id("F8", 12)
    project_debug_config = make_id("F8", 21)
    project_release_config = make_id("F8", 22)

    # Compile pbxproj file
    pbxproj_content = f"""// !$*UTF8*$!
{{
	archiveVersion = 1;
	classes = {{
	}};
	objectVersion = 56;
	objects = {{

/* Begin PBXBuildFile section */
{build_files_str}
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		{product_ref} /* HaniVoca.app */ = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = HaniVoca.app; sourceTree = BUILT_PRODUCTS_DIR; }};
{file_refs_str}
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		{frameworks_phase_id} /* Frameworks */ = {{
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		}};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		{main_group_id} /* Main Group */ = {{
			isa = PBXGroup;
			children = (
				{app_group_id} /* HaniVoca */,
				{products_group_id} /* Products */,
			);
			sourceTree = "<group>";
		}};
		{app_group_id} /* HaniVoca */ = {{
			isa = PBXGroup;
			children = (
				{make_id("F1", 1)} /* HaniVocaApp.swift */,
				{views_group_id} /* Views */,
				{models_group_id} /* Models */,
				{utils_group_id} /* Utils */,
				{resources_group_id} /* Resources */,
			);
			path = HaniVoca;
			sourceTree = "<group>";
		}};
		{views_group_id} /* Views */ = {{
			isa = PBXGroup;
			children = (
{views_children_str}
			);
			name = Views;
			sourceTree = "<group>";
		}};
		{models_group_id} /* Models */ = {{
			isa = PBXGroup;
			children = (
{models_children_str}
			);
			name = Models;
			sourceTree = "<group>";
		}};
		{utils_group_id} /* Utils */ = {{
			isa = PBXGroup;
			children = (
{utils_children_str}
			);
			name = Utils;
			sourceTree = "<group>";
		}};
		{resources_group_id} /* Resources */ = {{
			isa = PBXGroup;
			children = (
{resources_children_str}
			);
			name = Resources;
			sourceTree = "<group>";
		}};
		{products_group_id} /* Products */ = {{
			isa = PBXGroup;
			children = (
				{product_ref} /* HaniVoca.app */,
			);
			name = Products;
			sourceTree = "<group>";
		}};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		{target_id} /* HaniVoca */ = {{
			isa = PBXNativeTarget;
			buildConfigurationList = {target_config_list} /* Build configuration list for PBXNativeTarget "HaniVoca" */;
			buildPhases = (
				{sources_phase_id} /* Sources */,
				{frameworks_phase_id} /* Frameworks */,
				{resources_phase_id} /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = HaniVoca;
			productName = HaniVoca;
			productReference = {product_ref} /* HaniVoca.app */;
			productType = "com.apple.product-type.application";
		}};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		{project_id} /* Project object */ = {{
			isa = PBXProject;
			attributes = {{
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1400;
				LastUpgradeCheck = 1400;
				TargetAttributes = {{
					{target_id} = {{
						CreatedOnToolsVersion = 14.0;
					}};
				}};
			}};
			buildConfigurationList = {project_config_list} /* Build configuration list for PBXProject "HaniVoca" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = {main_group_id} /* Main Group */;
			productRefGroup = {products_group_id} /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				{target_id} /* HaniVoca */,
			);
		}};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		{resources_phase_id} /* Resources */ = {{
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
{resources_build_files_str}
			);
			runOnlyForDeploymentPostprocessing = 0;
		}};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		{sources_phase_id} /* Sources */ = {{
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
{sources_build_files_str}
			);
			runOnlyForDeploymentPostprocessing = 0;
		}};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		{target_debug_config} /* Debug */ = {{
			isa = XCBuildConfiguration;
			buildSettings = {{
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_IDENTITY = "-";
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_ASSET_PATHS = "";
				DEVELOPMENT_TEAM = "";
				ENABLE_PREVIEWS = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_CFBundleDisplayName = FluentFlow;
				INFOPLIST_KEY_LSApplicationCategoryType = "public.app-category.education";
				INFOPLIST_KEY_NSMicrophoneUsageDescription = "Ứng dụng cần sử dụng Microphone để ghi âm giọng đọc của bạn.";
				INFOPLIST_KEY_NSSpeechRecognitionUsageDescription = "Ứng dụng cần sử dụng Nhận dạng giọng nói để đánh giá độ chính xác khi đọc từ vựng.";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.fluentflow.FluentFlow;
				OTHER_LDFLAGS = (
					"$(inherited)",
					"-framework",
					"CloudKit",
				);
				PRODUCT_NAME = "$(TARGET_NAME)";
				SUPPORTED_PLATFORMS = "iphoneos iphonesimulator macosx appletvos appletvsimulator watchos watchsimulator";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2,6";
			}};
			name = Debug;
		}};
		{target_release_config} /* Release */ = {{
			isa = XCBuildConfiguration;
			buildSettings = {{
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_IDENTITY = "-";
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_ASSET_PATHS = "";
				DEVELOPMENT_TEAM = "";
				ENABLE_PREVIEWS = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_CFBundleDisplayName = FluentFlow;
				INFOPLIST_KEY_LSApplicationCategoryType = "public.app-category.education";
				INFOPLIST_KEY_NSMicrophoneUsageDescription = "Ứng dụng cần sử dụng Microphone để ghi âm giọng đọc của bạn.";
				INFOPLIST_KEY_NSSpeechRecognitionUsageDescription = "Ứng dụng cần sử dụng Nhận dạng giọng nói để đánh giá độ chính xác khi đọc từ vựng.";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.fluentflow.FluentFlow;
				OTHER_LDFLAGS = (
					"$(inherited)",
					"-framework",
					"CloudKit",
				);
				PRODUCT_NAME = "$(TARGET_NAME)";
				SUPPORTED_PLATFORMS = "iphoneos iphonesimulator macosx appletvos appletvsimulator watchos watchsimulator";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2,6";
			}};
			name = Release;
		}};
		{project_debug_config} /* Debug */ = {{
			isa = XCBuildConfiguration;
			buildSettings = {{
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_CXX_LIBRARY = "libc++";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_REPRODUCER = YES;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				GCC_C_LANGUAGE_STANDARD = gnu11;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_ACTUAL = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				MACOSX_DEPLOYMENT_TARGET = 14.0;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				MTL_FAST_MATH = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			}};
			name = Debug;
		}};
		{project_release_config} /* Release */ = {{
			isa = XCBuildConfiguration;
			buildSettings = {{
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_CXX_LIBRARY = "libc++";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_REPRODUCER = YES;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_C_LANGUAGE_STANDARD = gnu11;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_ACTUAL = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				MACOSX_DEPLOYMENT_TARGET = 14.0;
				MTL_ENABLE_DEBUG_INFO = NO;
				MTL_FAST_MATH = YES;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
			}};
			name = Release;
		}};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		{target_config_list} /* Build configuration list for PBXNativeTarget "HaniVoca" */ = {{
			isa = XCConfigurationList;
			buildConfigurations = (
				{target_debug_config} /* Debug */,
				{target_release_config} /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		}};
		{project_config_list} /* Build configuration list for PBXProject "HaniVoca" */ = {{
			isa = XCConfigurationList;
			buildConfigurations = (
				{project_debug_config} /* Debug */,
				{project_release_config} /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		}};
/* End XCConfigurationList section */
	}};
	rootObject = {project_id} /* Project object */;
}}
"""
    with open(os.path.join(xcodeproj_dir, "project.pbxproj"), "w", encoding="utf-8") as f:
        f.write(pbxproj_content)
        
    print("Successfully generated HaniVoca.xcodeproj with strict 24-character UUID mapping.")

if __name__ == "__main__":
    generate_xcodeproj()

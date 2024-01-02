#import <Foundation/Foundation.h>
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

// #import <UMCore/UMAppDelegateWrapper.h>
#import <Expo/Expo.h>

@interface AppDelegate : EXAppDelegateWrapper <RCTBridgeDelegate>
@property (nonatomic, strong) UIWindow *window;

@end

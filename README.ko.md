# VibeSlash 명령어 도우미

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **한국어**

**Claude Code·Codex 명령어 치트시트. 외울 필요 없이 한 번 누르면 바로 나옵니다.**

[![최신 버전](https://img.shields.io/github/v/release/joygogogo163/claudetools?label=%EC%B5%9C%EC%8B%A0%20%EB%B2%84%EC%A0%84)](https://github.com/joygogogo163/claudetools/releases/latest)
[![다운로드 수](https://img.shields.io/github/downloads/joygogogo163/claudetools/total?label=%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C)](https://github.com/joygogogo163/claudetools/releases)
[![빌드](https://img.shields.io/github/actions/workflow/status/joygogogo163/claudetools/extension.yml?label=%EB%B9%8C%EB%93%9C)](https://github.com/joygogogo163/claudetools/actions/workflows/extension.yml)
![Chrome / Edge](https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-4285F4)

**VibeSlash**는 Claude Code와 Codex의 슬래시 명령어(slash commands)를 위한 무료 오픈소스 도우미로, Chrome / Edge 브라우저 확장 프로그램과 Windows·macOS 데스크톱 앱이 있습니다. 브라우저 확장 프로그램은 [Claude Code 웹 버전](https://claude.ai/code)에서 슬래시 명령어를 더 빠르게 입력하도록 도와줍니다. 입력창 맨 앞에 `/`를 입력하면 명령어 추천이 뜨고, `Alt+K`를 누르면 전체 명령어 팔레트가 열립니다. 명령어마다 설명, 사용 시점, 예시, 웹 버전 주의 사항이 붙어 있습니다. `/compact`, `/context`, `/code-review`를 어떻게 쓰는지 기억나지 않나요? 중국어 키워드 「压缩」(압축), 「上下文」(컨텍스트), 「审查」(리뷰)로 검색하면 바로 찾을 수 있고, `comp`처럼 명령어 이름 일부만 입력해도 찾아 줍니다.

브라우저 툴바의 확장 프로그램 아이콘을 누르면 **OpenAI Codex**와 **DeepSeek Harness**의 모든 슬래시 명령어도 바로 찾아볼 수 있으며, Codex 명령어마다 Codex CLI, IDE 확장 프로그램, ChatGPT 데스크톱 앱에서 쓸 수 있는지 표시되어 있습니다.

**데스크톱 앱**(미리보기)은 트레이나 메뉴 막대에 상주합니다. Claude 데스크톱 앱, ChatGPT 데스크톱 앱의 Codex 모드, 또는 터미널에서 실행 중인 `claude` / `codex`에서 `Alt + /`(macOS는 `⌥ /`)를 누르면 입력창 옆에 명령어 팔레트가 열리고, 지금 어떤 도구를 쓰고 있는지 자동으로 인식해 고른 명령어를 바로 입력합니다. 데스크톱 앱에서는 브라우저 확장 프로그램처럼 입력창 맨 앞에 `/`를 입력하거나 화면의 `/` 플로팅 버튼을 눌러도 열립니다.

> 🪶 **신경 쓰이지 않을 만큼 가볍게**: 브라우저 확장 프로그램은 **52 KB**, Windows 설치 파일은 **1.3 MB**, macOS 설치 파일은 **1 MB**뿐입니다. .NET, Java, Node.js를 설치할 필요가 없고, 몇 초면 내려받아 바로 쓸 수 있습니다.

[**⬇ 다운로드**](https://github.com/joygogogo163/claudetools/releases) · [설치 방법](#설치) · [데스크톱 앱](#데스크톱-앱-windows--macos) · [명령어 모음](#명령어-모음) · [자주 묻는 질문](#자주-묻는-질문) · [웹사이트](https://joygogogo163.github.io/claudetools/ko/)

![Claude Code 웹 버전에서 /co 를 입력하면 /compact, /context, /code-review 등의 추천이 표시됨](apps/extension/docs/suggest.png)

## 목차

- [기능](#기능)
- [스크린샷](#스크린샷)
- [데스크톱 앱 (Windows / macOS)](#데스크톱-앱-windows--macos)
- [설치](#설치)
- [명령어 모음](#명령어-모음)
  - [Claude Code 명령어 모음](#claude-code-명령어-모음)
  - [Codex 명령어 모음](#codex-명령어-모음)
  - [DeepSeek 명령어 모음](#deepseek-명령어-모음)
- [자주 묻는 질문](#자주-묻는-질문)
- [로드맵](#로드맵)
- [상표 고지](#상표-고지)

## 기능

> 앱 화면과 앱 안의 명령어 설명은 현재 중국어로만 제공됩니다. 명령어 이름·인수·예시는 그대로 쓸 수 있고, 모든 명령어의 한국어 설명은 [웹사이트](https://joygogogo163.github.io/claudetools/ko/)에서 볼 수 있습니다.

- **`/`만 입력하면 추천**: 메시지 맨 앞에 `/`를 입력하면 입력창 위에 일치하는 명령어가 나열됩니다. `↑↓`로 고르고, `Tab` / `Enter`로 확정하며, `Esc`로 닫습니다.
- **명령어 검색**: 명령어 이름, 별칭, 중국어 용도로 검색합니다. 이름은 일부만 입력해도 되는 퍼지 검색이라 `comp`로 `/compact`를, `review`로 `/code-review`와 `/security-review`를 찾습니다. 중국어 키워드로도 찾을 수 있어 「压缩」(압축)으로 `/compact`를, 「审查」(리뷰)로 `/code-review`를 찾습니다.
- **중국어 입력기 지원**: 중국어 입력기에서 `/`를 누르면 입력되는 `、`나 `／`로도 추천이 뜨고, 명령어를 고르면 반각 `/`로 자동으로 바뀝니다.
- **명령어 팔레트**: `Alt+K`를 누르거나 오른쪽 아래의 `/` 플로팅 버튼을 눌러 엽니다. 카테고리별로 둘러볼 수 있고, 오른쪽에 인수, 사용법, 예시, 웹 버전 주의 사항이 표시됩니다. `Ctrl+Enter`는 입력하고 바로 전송하며, `Shift+Enter`는 예시를 입력합니다.
- **웹 버전 주의 사항**: 웹 버전에서 인수가 꼭 필요한 명령어(`/model`, `/effort` 등)나 쓸 수 없는 명령어(`/clear` 등)를 표시해 실수를 막아 줍니다.
- **최근 사용**: 자주 쓰는 명령어가 자동으로 맨 앞에 옵니다.
- **사용자 정의 명령어**: 저장소의 스킬(`.claude/skills`), 명령어(`.claude/commands`)나 팀에서 정한 지시문을 추가할 수 있습니다. JSON 가져오기·내보내기를 지원하며, 브라우저 계정을 따라 동기화됩니다.
- **다크 모드**: 페이지에 맞춰 자동으로 전환됩니다.
- **Codex·DeepSeek 명령어 조회**: 툴바 팝업에서 Claude Code, Codex, DeepSeek 사이를 전환할 수 있고(`Tab`), Codex나 DeepSeek Harness 페이지를 열면 자동으로 전환됩니다. Codex 명령어마다 쓸 수 있는 환경(터미널, IDE, 데스크톱)도 표시합니다.
- **가벼움**: 확장 프로그램 52 KB, 데스크톱 앱 설치 파일 약 1 MB이며, 별도의 런타임이 필요 없습니다.
- **개인정보 보호**: 네트워크 요청을 전혀 하지 않고 대화 기록을 읽지 않으며, 내 컴퓨터에서만 동작합니다.

## 스크린샷

**명령어 팔레트**: 중국어로 「审查」(리뷰)를 검색한 화면입니다. 오른쪽에 사용법, 별칭, 예시가 표시됩니다

![VibeSlash 명령어 팔레트: “审查”(리뷰)로 검색해 /code-review, /security-review, /simplify 등 Claude Code 명령어와 중국어 설명이 나열됨](apps/extension/docs/palette.png)

**다크 모드**: 입력창에 이미 글자가 있으면 명령어가 맨 앞에 입력되고, 원래 글자는 인수가 됩니다

![VibeSlash 다크 모드 명령어 팔레트: “压缩”(압축)으로 검색해 /compact 와 /autocompact 를 찾음](apps/extension/docs/palette-dark.png)

**툴바 팝업**: 확장 프로그램 아이콘을 눌러 모든 명령어를 바로 찾아보고, Claude Code와 Codex 사이를 전환합니다. 다른 웹 페이지에서는 누르면 복사됩니다

| Claude Code | Codex | 다크 모드 |
| :-: | :-: | :-: |
| <img src="apps/extension/docs/popup.png" width="260" alt="VibeSlash 브라우저 툴바 팝업. 최근 사용과 카테고리별로 Claude Code 슬래시 명령어를 나열함"> | <img src="apps/extension/docs/popup-codex.png" width="260" alt="VibeSlash 팝업을 Codex로 전환해 Codex 슬래시 명령어와 터미널·IDE·데스크톱 중 쓸 수 있는 환경을 표시함"> | <img src="apps/extension/docs/popup-dark.png" width="260" alt="VibeSlash 브라우저 툴바 팝업(다크 모드)"> |

**설정 페이지**: 추천과 플로팅 버튼을 켜고 끄며, Claude Code나 Codex에 사용자 정의 명령어를 추가합니다

![VibeSlash 설정 페이지: 기본 설정과 사용자 정의 명령어 목록](apps/extension/docs/options.png)

## 데스크톱 앱 (Windows / macOS)

데스크톱 앱은 브라우저 없이 데스크톱 클라이언트와 터미널에서 명령어 팔레트를 엽니다. 여는 방법은 세 가지입니다. 단축키(`Alt + /`, macOS는 `⌥ /`)를 누르거나, 데스크톱 앱의 입력창 맨 앞에 `/`를 입력하거나, 화면의 `/` 플로팅 버튼을 누릅니다.

| 앞에 있는 창 | 인식 결과 | 표시되는 명령어 |
| :- | :- | :- |
| Claude 데스크톱 앱(Code 탭) | Claude Code · 데스크톱 | 데스크톱 앱에서 쓸 수 있는 Claude Code 명령어. 인수가 필요한 명령어는 따로 표시 |
| ChatGPT 데스크톱 앱(Codex 모드) | Codex · 데스크톱 | 데스크톱 앱이 지원하는 Codex 명령어 |
| DeepSeek Harness 데스크톱 앱 | DeepSeek · 데스크톱 | DeepSeek Harness 명령어 |
| 터미널에서 실행 중인 `claude` / `codex` | Claude Code / Codex · 터미널 | 터미널의 하위 프로세스와 창 제목으로 판단 |
| VS Code, Cursor, JetBrains 등의 편집기 | 위와 같음. 편집기 안의 Codex는 IDE 확장 프로그램으로 취급 | IDE 확장 프로그램이 지원하는 Codex 명령어 |
| 인식할 수 없는 창 | 마지막으로 사용한 도구 | 모든 명령어. `Tab`으로 전환 가능 |

- **`/`를 입력하면 바로 열림**: 브라우저 확장 프로그램처럼 Claude, ChatGPT, DeepSeek Harness 데스크톱 앱의 입력창 맨 앞에 `/`를 입력하면(중국어 입력기로 입력한 `、`도 인식) 명령어 팔레트가 바로 열리고, 이어서 입력하는 글자는 검색어가 됩니다. 명령어를 고르면 방금 입력한 `/`는 자동으로 지워지고, `Esc`를 누르면 그대로 남습니다. 터미널의 Claude Code와 Codex에는 자체 명령어 메뉴가 있으므로 이 기능은 데스크톱 앱에서만 동작하며, 설정에서 끌 수 있습니다.
- **플로팅 버튼**: 화면에 포커스를 빼앗지 않는 작은 `/` 원형 버튼이 있습니다. 한 번 누르면 명령어 팔레트가 열리고, 누른 채로 끌어 원하는 위치로 옮길 수 있으며(위치는 기억됩니다), 오른쪽 클릭하면 설정이 열립니다. "자동"(Claude, ChatGPT, DeepSeek Harness 데스크톱 앱이 앞에 있을 때 표시, 기본값), "항상 표시", "표시 안 함" 중에서 고를 수 있습니다.
- **입력창 바로 옆에 표시**: 입력창의 위치를 읽어(Windows는 UI Automation, macOS는 손쉬운 사용 API) 팔레트를 가능하면 입력창 위쪽에 띄웁니다.
- **고르면 바로 입력**: `Enter`는 입력, `Ctrl+Enter`(macOS는 `⌘↩`)는 입력하고 전송, `Shift+Enter`는 예시를 입력합니다. 기본적으로 클립보드를 빌려 붙여 넣고, 끝나면 원래 클립보드 내용을 되돌려 놓습니다. 한 글자씩 입력하는 방식으로 바꿀 수도 있습니다.
- **가벼움**: 설치 파일이 1 MB 안팎이라 몇 초면 내려받습니다. Windows 버전은 Rust로 작성했고 화면은 시스템에 내장된 WebView2를 씁니다. macOS 버전은 네이티브 Swift 앱(AppKit + SwiftUI)입니다. 둘 다 .NET, Java, Node.js 같은 런타임을 설치할 필요가 없고, Electron 앱처럼 브라우저 엔진을 통째로 담고 있지도 않습니다(그런 앱은 설치 파일이 수백 MB에 이르는 경우가 많습니다).

| 다운로드 | 크기 |
| :- | :-: |
| 브라우저 확장 프로그램(Chrome / Edge) | **52 KB** |
| Windows 설치 파일(`setup.exe`) | **1.3 MB** |
| Windows 포터블 버전(`portable.zip`, 압축만 풀면 바로 실행) | **1.6 MB** |
| macOS 설치 파일(`.dmg`, Apple 실리콘과 Intel 공용) | **1.0 MB** |

<sub>Releases에 있는 확장 프로그램 v1.1.1, 데스크톱 앱 v0.1.0의 파일 크기 기준입니다.</sub>

| Windows: Claude 데스크톱 앱 인식 | Windows: 터미널의 Codex 인식(다크 모드) |
| :-: | :-: |
| <img src="apps/windows/docs/palette-claude.png" width="420" alt="VibeSlash 데스크톱 앱이 Claude 데스크톱 앱을 인식해 Claude Code 명령어를 보여 주고, 인수가 필요한 명령어를 표시함"> | <img src="apps/windows/docs/palette-codex.png" width="420" alt="VibeSlash 데스크톱 앱 다크 모드. 터미널의 Codex를 인식하고 “审查”(리뷰)로 검색해 /review 를 찾음"> |

> 데스크톱 앱은 아직 미리보기 버전이며, 설치 파일은 아직 서명되지 않았습니다. macOS 버전은 입력창 위치를 읽고, 입력한 `/`를 인식하고, 명령어를 입력하기 위해 "손쉬운 사용" 권한이 필요합니다. 권한을 허용하지 않으면 고른 명령어는 클립보드에 복사만 됩니다. `/`를 입력하면 열리는 기능은 누른 키가 슬래시 키인지만 확인하며, 어떤 키 입력 내용도 기록하거나 업로드하지 않습니다.

## 설치

### 브라우저 확장 프로그램

1. [Releases](https://github.com/joygogogo163/claudetools/releases/latest)에서 최신 `vibeslash-extension-v*.zip`을 내려받아 고정된 폴더에 압축을 풉니다(이후에 이 폴더를 지우거나 옮기지 마세요).
2. `chrome://extensions`(Edge는 `edge://extensions`)를 열고 오른쪽 위의 "개발자 모드"를 켭니다.
3. "압축해제된 확장 프로그램을 로드합니다"를 누르고, 압축을 푼 폴더(`manifest.json`이 바로 들어 있는 폴더)를 선택합니다.
4. 이미 열려 있는 claude.ai/code 페이지를 새로고침하고, 입력창에 `/`를 입력해 보세요.

업데이트할 때는 새 버전을 원래 폴더에 덮어써서 압축을 풀고, 확장 프로그램 관리 페이지에서 새로고침 버튼을 누른 다음 claude.ai 페이지를 새로고침합니다. 더 자세한 내용(사용자 정의 명령어의 JSON 형식, 개발과 테스트)은 [확장 프로그램 문서](apps/extension/README.md)를 참고하세요.

### Windows 앱

[Releases](https://github.com/joygogogo163/claudetools/releases/latest)에서 `VibeSlash-*-windows-x64-setup.exe`를 내려받아 설치합니다(또는 portable.zip을 내려받아 압축을 풀고 바로 실행합니다). 실행하면 트레이에 상주하며, 기본 단축키는 `Alt + /`이고 설정에서 바꿀 수 있습니다. "알 수 없는 게시자"라는 경고가 뜨면 "추가 정보" → "실행"을 누르세요.

### macOS 앱

[Releases](https://github.com/joygogogo163/claudetools/releases/latest)에서 `VibeSlash-*-macos.dmg`를 내려받아 VibeSlash를 "응용 프로그램" 폴더로 끌어다 놓습니다. 처음 열 때는 "응용 프로그램"에서 VibeSlash를 오른쪽 클릭해 "열기"를 선택한 다음, 안내에 따라 "시스템 설정 › 개인정보 보호 및 보안 › 손쉬운 사용"에서 VibeSlash를 허용하세요. 실행하면 메뉴 막대에 상주하며, 기본 단축키는 `⌥ /`입니다. macOS 14 이상이 필요합니다.

## 명령어 모음

아래 표는 VibeSlash의 명령어 데이터에서 자동으로 생성되며, 확장 프로그램에 표시되는 내용과 같습니다.

### Claude Code 명령어 모음

VibeSlash에 수록된 Claude Code 슬래시 명령어를 카테고리별로 정리했으며, 웹 버전(클라우드 세션)에서 의미가 있는 명령어만 담았습니다. 공식 문서 [Commands](https://code.claude.com/docs/en/commands)와 [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)를 바탕으로 했습니다. 실제 사용 가능 여부는 요금제, Claude Code 버전, 조직 정책에 따라서도 달라지며, 세션에서 `/help`를 보내면 지금 쓸 수 있는 명령어를 확인할 수 있습니다.

<!-- commands:claude-code:start -->
<!-- scripts/readme.ts로 생성됨. 직접 수정하지 마세요 -->

#### 컨텍스트

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/compact [남길 내용]` | 컨텍스트 압축: 지금까지의 대화를 요약해 컨텍스트 공간을 확보하고 세션을 이어 갑니다. |  |
| `/context [all]` | 현재 컨텍스트 사용량을 컬러 그리드로 표시하고 최적화 제안을 제공합니다. |  |
| `/btw [질문]` | 곁가지 질문을 하나 합니다. 질문과 답변은 대화 기록에 남지 않습니다. |  |
| `/recap` | 현재 세션을 한 문장으로 즉시 요약합니다. |  |
| `/autocompact [auto\|<크기>]` | 자동 압축 기준 설정: 컨텍스트를 얼마나 사용했을 때 자동으로 압축할지 정합니다. |  |
| `/clear [이름]` | 컨텍스트가 비어 있는 새 대화를 시작합니다. | 웹에서 사용 불가; 별칭 `/reset` `/new` |

#### 모델과 모드

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/model <모델>` | 모델을 전환합니다. | 웹에서는 인수 필요 |
| `/effort <low\|medium\|high\|xhigh\|max\|auto>` | 추론 강도를 조정합니다. status로 현재 값을 확인하고, ultracode on/off로 ultracode를 켜고 끕니다. | 웹에서는 인수 필요 |
| `/fast [on\|off]` | 빠른 모드를 켜고 꺼서 출력 속도를 높입니다. |  |
| `/plan [작업 설명]` | 계획 모드로 들어갑니다: 먼저 분석하고 방안을 제시한 뒤, 확인을 받고 나서 코드를 수정합니다. |  |
| `/advisor [모델\|off]` | 어드바이저 도구를 켜거나 끕니다: 주요 시점마다 두 번째 모델의 의견을 구합니다. | 웹에서는 인수 필요 |
| `/goal [완료 조건\|clear]` | 목표 설정: Claude가 조건을 달성할 때까지 여러 턴에 걸쳐 계속 작업합니다. |  |
| `/output-style [스타일]` | 출력 스타일을 나열하거나 전환합니다. |  |

#### 리뷰와 검증

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/code-review [강도] [--fix] [--comment] [PR 번호\|브랜치\|경로]` | 현재 변경 사항(또는 지정한 PR, 브랜치, 경로)에서 정확성 버그를 리뷰합니다. | 내장 스킬; 별칭 `/review` `/ultrareview` |
| `/security-review` | 현재 브랜치에서 기본 브랜치 대비 변경 사항에 보안 취약점(인젝션, 인증, 데이터 유출 등)이 있는지 검사합니다. |  |
| `/simplify [대상]` | 변경 사항의 재사용, 단순화, 효율, 추상화 수준 문제를 검토하고 직접 수정합니다(버그는 찾지 않습니다). | 내장 스킬 |
| `/verify` | 테스트나 타입 검사만 보지 않고, 앱을 실제로 빌드하고 실행해 변경이 적용되었는지 확인합니다. | 내장 스킬 |
| `/run` | 프로젝트 앱을 실행하고 조작해 변경의 실제 효과를 확인합니다. | 내장 스킬 |

#### 작업과 자동화

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/loop [간격] [프롬프트]` | 세션이 유지되는 동안 프롬프트를 일정 간격으로 반복 실행합니다. 간격을 쓰지 않으면 Claude가 직접 속도를 조절합니다. | 내장 스킬; 별칭 `/proactive` |
| `/batch <지시>` | 대규모 병렬 변경: 작업을 5~30개의 독립 단위로 나누고, 각 단위를 백그라운드 서브에이전트가 별도의 worktree에서 처리합니다. | 내장 스킬 |
| `/subtask <작업>` | 전체 대화를 이어받은 백그라운드 서브에이전트를 보내 곁가지 작업을 처리하고, 완료되면 결과가 현재 대화로 돌아옵니다. |  |
| `/schedule [설명]` | 클라우드에서 실행되는 예약 작업(Routines)을 생성, 수정, 나열하거나 실행합니다. | 별칭 `/routines` |
| `/tasks` | 현재 세션의 백그라운드 작업(완료된 서브에이전트 포함)을 확인하고 관리합니다. | 별칭 `/bashes` |
| `/deep-research <질문>` | 웹을 병렬로 검색하고 출처를 교차 검증해 인용이 포함된 리서치 보고서를 작성합니다. | 내장 워크플로 |

#### 프로젝트와 설정

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/init` | 프로젝트를 분석해 초기 CLAUDE.md 프로젝트 가이드를 생성합니다. |  |
| `/update-config [요청 사항]` | 설정 변경 사항(특정 명령 허용, 환경 변수 설정, hook 추가)을 자연어로 설명하면 Claude가 settings.json을 수정합니다. | 내장 스킬 |
| `/fewer-permission-prompts` | 기록에서 자주 쓰인 읽기 전용 명령을 찾아 프로젝트 .claude/settings.json의 허용 목록에 추가합니다. | 내장 스킬 |
| `/doctor [prompt-audit [경로]]` | 설치, 설정, 확장 기능, CLAUDE.md의 문제를 점검하고, 확인을 받으면 Claude가 수정합니다. | 내장 스킬; 별칭 `/checkup` |
| `/debug [문제 설명]` | 현재 세션의 디버그 로그를 켜고, 로그를 읽어 문제를 진단합니다. | 내장 스킬 |
| `/reload-skills` | 스킬과 명령어 디렉터리를 다시 스캔해, 세션 중에 추가하거나 수정한 스킬을 바로 사용할 수 있게 합니다. |  |
| `/mcp [reconnect\|enable\|disable <서버\|all>]` | MCP 서버 연결과 인증을 관리합니다. |  |
| `/config` | Claude Code 설정을 엽니다. | 별칭 `/settings` |

#### 세션

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/rename <이름>` | 현재 세션의 이름을 변경합니다. | 웹에서는 인수 필요 |
| `/color <색상\|default>` | 현재 세션 프롬프트 바의 색상을 설정합니다. | 웹에서는 인수 필요 |
| `/usage` | 이번 세션의 비용, 요금제 사용량, 활동 통계를 확인합니다. | 별칭 `/cost` `/stats` |
| `/teleport` | claude --teleport <세션 ID> 명령을 제공해, 로컬 터미널에서 이 클라우드 세션을 이어받을 수 있게 합니다. | 별칭 `/tp` |
| `/export [파일 이름]` | 현재 대화를 일반 텍스트로 내보냅니다. 파일 이름을 붙이면 해당 파일에 바로 씁니다. |  |
| `/help` | 도움말과 사용 가능한 명령어를 표시합니다. |  |

#### 내장 스킬

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/claude-api [하위 명령]` | Claude API와 Managed Agents 참고 자료(모델, SDK 사용법, 캐싱 등)를 불러옵니다. | 내장 스킬 |
| `/dataviz [요청 사항]` | 차트와 대시보드 디자인 가이드: 차트 형식을 고르고, 역할에 따라 색을 지정하며 색각 이상 안전성과 대비를 검증합니다. | 내장 스킬 |
| `/design [요청 사항]` | UI 스케치, 페이지 흐름, 포스터를 편집 가능한 Claude Design 캔버스로 그립니다. | 내장 스킬 |
| `/slides [요청 사항]` | 간단한 설명을 바탕으로 Claude Slides 프레젠테이션을 생성합니다. | 내장 스킬 |

<!-- commands:claude-code:end -->

### Codex 명령어 모음

OpenAI Codex의 슬래시 명령어로, 공식 문서 [Developer commands](https://learn.chatgpt.com/docs/developer-commands)와 [Slash commands](https://learn.chatgpt.com/docs/reference/slash-commands)를 바탕으로 정리했습니다. Codex 명령어는 터미널의 Codex CLI, IDE 확장 프로그램, ChatGPT 데스크톱 앱의 Codex 모드 세 곳에서 동작하며, 각각 지원하는 명령어가 조금씩 다릅니다. 일부 환경에서만 쓸 수 있는 명령어는 비고에 표시했습니다. 일부 명령어(`/plan`, `/goal`, `/fast` 등)는 계정, 모델, 기능 플래그에 따라서도 달라집니다. ChatGPT 웹 버전에는 자체 명령어 메뉴가 있어 이 명령어들이 동작하지 않습니다.

<!-- commands:codex:start -->
<!-- scripts/readme.ts로 생성됨. 직접 수정하지 마세요 -->

#### 컨텍스트

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/compact` | 컨텍스트 압축: 이전 대화를 요약해 컨텍스트 공간을 확보합니다. |  |
| `/recap` | 현재 대화의 요약을 생성하지만 컨텍스트는 압축하지 않습니다. | 터미널에서만 |
| `/side [질문]` | 메인 대화를 방해하거나 영향을 주지 않는 임시 곁가지 대화를 엽니다. | 별칭 `/btw` |
| `/mention <경로>` | 파일이나 폴더를 대화에 추가해 이후 턴에서 바로 참조하게 합니다. | 터미널에서만 |
| `/ide [설명]` | 에디터에서 열린 파일, 현재 선택 영역 등의 컨텍스트를 다음 프롬프트에 함께 보냅니다. | 터미널에서만 |
| `/ide-context` | IDE 컨텍스트 자동 첨부를 켜고 끕니다. | 데스크톱, IDE에서만 |
| `/memories` | 기존 메모리를 사용할지, 새 메모리를 생성할지 설정합니다. |  |

#### 모델과 권한

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/model` | 현재 사용할 모델(및 추론 강도)을 선택합니다. |  |
| `/reasoning` | 현재 대화의 추론 강도를 선택합니다. | 데스크톱, IDE에서만 |
| `/fast` | 현재 모델의 Fast 단계를 켜고 끕니다. 선택은 저장됩니다. |  |
| `/personality` | Codex 응답 스타일을 선택합니다. | 데스크톱, IDE에서만 |
| `/plan [프롬프트]` | 계획 모드로 전환하며, 첫 번째 계획 요청을 함께 붙일 수 있습니다. |  |
| `/goal [목표\|edit\|pause\|resume\|clear]` | 작업 목표를 설정, 확인, 수정, 일시 중지, 재개 또는 삭제합니다. |  |
| `/permissions` | Codex가 확인 없이 바로 실행할 수 있는 작업을 설정합니다. | 터미널에서만 |
| `/approve` | 자동 검토가 최근 거부한 작업 하나를 승인해 한 번 다시 시도합니다. |  |
| `/experimental` | 네트워크 프록시, 실행 중 절전 방지 등 실험적 기능을 켜고 끕니다. | 터미널에서만 |

#### 리뷰와 변경 사항

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/review [설명]` | Codex가 작업 공간의 변경 사항을 리뷰해 문제를 찾게 합니다. |  |
| `/diff` | Git에서 아직 추적하지 않는 새 파일을 포함해 Git 변경 사항을 표시합니다. | 터미널에서만 |
| `/init` | 현재 디렉터리에 AGENTS.md를 생성해 Codex를 위한 장기 지침을 작성합니다. |  |

#### 작업 공간과 실행 위치

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/worktree` | 새 Git worktree에서 대화를 시작하거나 이어 갑니다. |  |
| `/local` | 대화를 로컬 작업 공간에서 실행합니다. | 데스크톱, IDE에서만 |
| `/cloud` | 대화를 클라우드에서 실행합니다. | 데스크톱, IDE에서만 |
| `/cloud-environment` | 이번 대화에서 사용할 클라우드 환경을 선택합니다. | 데스크톱, IDE에서만 |
| `/project` | 새 대화가 속할 프로젝트를 선택합니다. | 데스크톱, IDE에서만 |
| `/cd [경로]` | 세션의 작업 디렉터리를 변경합니다. 경로를 지정하지 않으면 홈 디렉터리로 이동합니다. | 터미널에서만 |
| `/pwd` | 현재 세션의 작업 디렉터리를 표시합니다. | 터미널에서만; 별칭 `/cwd` |

#### 세션

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/new [이름]` | 새 대화를 시작하며, 이름을 함께 지정할 수 있습니다. | 데스크톱, 터미널에서만 |
| `/clear [이름]` | 터미널을 지우고 새 대화를 시작합니다. | 터미널에서만 |
| `/rename [이름]` | 현재 대화의 이름을 변경합니다. | 데스크톱, 터미널에서만 |
| `/fork` | 현재 대화를 복제해 새 대화를 만듭니다. |  |
| `/resume` | 세션 목록에서 이전에 저장한 대화를 복원합니다. | 터미널에서만 |
| `/archive` | 현재 세션을 보관합니다: 세션 목록에서 제거하지만 기록은 유지합니다. | 데스크톱, 터미널에서만 |
| `/delete` | 현재 세션과 거기서 파생된 하위 세션을 영구 삭제합니다. | 터미널에서만 |
| `/agents` | 에이전트 지휘 센터를 열어 대화를 둘러보고 에이전트 간에 전환합니다. | 터미널에서만 |
| `/subagents` | 현재 세션의 특정 서브에이전트 스레드로 전환합니다. | 터미널에서만 |
| `/copy` | Codex의 가장 최근 전체 응답을 복사합니다. | 터미널에서만 |
| `/export [파일 이름]` | 전체 대화를 Markdown으로 내보내 클립보드에 복사하거나 파일로 저장합니다. | 터미널에서만 |
| `/app` | ChatGPT 데스크톱 앱에서 현재 세션을 이어 갑니다. | 터미널에서만 |
| `/quit` | Codex CLI를 종료합니다. | 터미널에서만; 별칭 `/exit` |

#### 스킬과 확장

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/skills` | 스킬을 둘러보고 사용해, Codex가 스킬의 지침에 따라 특정 작업을 수행하게 합니다. | 터미널에서만 |
| `/mcp [verbose\|login <이름>]` | 구성된 MCP 도구와 연결 상태를 확인합니다. |  |
| `/apps` | 앱(커넥터)을 둘러보고 프롬프트에 삽입합니다. | 터미널에서만 |
| `/plugins` | 설치된 플러그인과 설치 가능한 플러그인을 둘러봅니다. | 터미널에서만 |
| `/hooks` | 라이프사이클 훅을 확인하고 관리합니다. | 터미널에서만 |
| `/import` | Claude Code 또는 Cursor에서 설정, 프로젝트 파일, 최근 대화를 가져옵니다. | 터미널에서만 |
| `/ps` | 백그라운드 터미널과 최근 출력을 나열합니다. | 터미널에서만 |
| `/stop` | 현재 세션의 모든 백그라운드 터미널을 중지합니다. | 터미널에서만; 별칭 `/clean` |

#### 설정과 진단

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/status` | 세션 구성과 사용량을 표시합니다: 현재 모델, 승인 정책, 쓰기 가능한 디렉터리, 남은 컨텍스트 등. |  |
| `/usage [daily\|weekly\|cumulative]` | 계정의 token 사용량을 확인하거나, 한도 초기화를 한 번 사용합니다. | 데스크톱, 터미널에서만 |
| `/statusline` | 하단 상태 표시줄에 표시할 정보와 순서를 설정합니다. | 터미널에서만 |
| `/title` | 터미널 창이나 탭 제목에 표시할 정보를 설정합니다. | 터미널에서만 |
| `/theme` | 코드 하이라이트 테마를 선택합니다. 미리 본 뒤 저장할 수 있습니다. | 터미널에서만 |
| `/pet [off]` | 화면의 작은 펫을 선택하거나 숨깁니다. | 데스크톱, 터미널에서만; 별칭 `/pets` |
| `/tui` | 다음 실행 시 사용할 터미널 모드(스크롤백 또는 전체 화면)를 선택합니다. | 터미널에서만 |
| `/vim` | 입력창의 Vim 모드를 켜고 끕니다. | 터미널에서만 |
| `/keymap` | TUI 단축키를 확인하고 수정해 config.toml에 저장합니다. | 터미널에서만 |
| `/raw [on\|off]` | 원시 스크롤 모드를 켜고 꺼서 터미널에서 선택과 복사를 더 편하게 합니다. | 터미널에서만 |
| `/debug-config` | 구성 계층과 정책 출처를 출력해 설정이 적용되지 않는 이유를 진단합니다. | 터미널에서만 |
| `/daemon` | 로컬 백그라운드 서비스의 관리 화면을 엽니다. | 터미널에서만 |
| `/warnings` | 세션에 남아 있는 경고와 진단 정보를 확인합니다. | 터미널에서만 |
| `/setup-default-sandbox` | Windows에서 권한이 상승된 에이전트 샌드박스를 설정합니다. | 터미널에서만 |
| `/feedback` | Codex 팀에 피드백을 보냅니다. 로그를 첨부할 수 있습니다. |  |
| `/logout` | Codex에서 로그아웃하고 로컬 자격 증명을 삭제합니다. | 터미널에서만 |

<!-- commands:codex:end -->

### DeepSeek 명령어 모음

DeepSeek의 공식 에이전트 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)(`dsh`)의 내장 슬래시 명령어로, 공식 저장소의 [명령어 문서](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/commands.md)와 소스 코드를 바탕으로 정리했습니다. 이 명령어들은 Harness 웹 UI(`npx @deepseek-ai/dsh web`, 기본 <http://127.0.0.1:3080>)나 데스크톱 앱의 입력창에서 입력하며, 명령줄 모드에는 명령어 메뉴가 없습니다. `.dsh/skills`에 둔 스킬도 `/스킬이름`으로 메뉴에 나타납니다. Harness는 아직 개발자 프리뷰라서 버전에 따라 명령어가 추가되거나 빠질 수 있습니다.

DeepSeek 문서대로 Claude Code를 DeepSeek API에 연결해 쓰고 있다면 Claude Code 명령어를 쓰는 것이므로, 위의 [Claude Code 명령어 모음](#claude-code-명령어-모음)을 보세요.

<!-- commands:deepseek:start -->
<!-- scripts/readme.ts로 생성됨. 직접 수정하지 마세요 -->

#### 모드와 권한

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/plan [off\|메시지]` | 플랜 모드에 들어가거나 나옵니다. 먼저 계획을 제시하고 확인 후에 수정합니다. |  |
| `/goal [목표\|clear\|edit <목표>\|pause\|resume]` | 장기 작업의 목표를 설정하거나 확인합니다. Harness는 목표를 향해 계속 작업합니다. |  |
| `/permission <프리셋>` | 권한 프리셋(샌드박스 모드와 승인 정책)을 전환합니다. |  |

#### 컨텍스트

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/compact` | 오래된 대화 기록을 압축해 컨텍스트 공간을 확보합니다. |  |

#### 세션

| 명령어 | 기능 | 비고 |
| :- | :- | :- |
| `/export` | 이 세션의 로그를 ZIP 파일로 내려받습니다. |  |
| `/feedback <내용>` | 이 세션에 대한 피드백을 기록합니다. |  |

<!-- commands:deepseek:end -->

## 자주 묻는 질문

### Claude Code 웹 버전에서 슬래시 명령어를 쓸 수 있나요?

쓸 수 있습니다. 클라우드 세션에서는 `/compact`, `/context`, `/code-review`처럼 텍스트를 출력하는 내장 명령어 대부분을 실행할 수 있습니다. 터미널 화면에서만 실행되는 명령어(`/plugin`, `/resume`, `/theme` 등)는 웹 버전에서 쓸 수 없으며, VibeSlash에도 수록하지 않았습니다.

### `/compact`와 `/clear`는 어떻게 다른가요?

`/compact`는 지금까지의 대화를 요약해 컨텍스트 공간을 확보하고 세션을 이어 갑니다. `/clear`는 컨텍스트가 비어 있는 새 대화를 시작합니다. 웹 버전은 `/clear`를 지원하지 않으므로, 처음부터 다시 시작하려면 사이드바에서 새 세션을 만드세요.

### 웹 버전에서 `/model`, `/effort`를 입력해도 선택 화면이 뜨지 않는 이유는?

웹 버전에서는 터미널의 대화형 선택 화면이 뜨지 않으므로 `/model opus`, `/effort high`처럼 인수를 직접 넣어야 합니다. VibeSlash는 이런 명령어에 "인수 필요"를 표시하고 예시를 보여 줍니다.

### 입력이 안 되거나 "클립보드에 복사됨"이라는 메시지가 뜨나요?

확장 프로그램은 페이지 맨 아래에 보이는 입력창을 자동으로 찾습니다(메시지는 「已复制到剪贴板」처럼 중국어로 표시됩니다). 웹 페이지가 개편되어 입력창을 찾지 못하면, 입력창에서 오른쪽 클릭 → "검사"를 눌러 입력창 하나만 정확히 가리키는 CSS 선택자를 찾고, 설정 페이지의 「输入框选择器」(입력창 선택자) 칸에 넣으세요.

### 웹 버전에 내장된 명령어 메뉴와 겹치면 어떻게 하나요?

설정 페이지에서 「在输入框开头输入 / 时弹出联想」(입력창 맨 앞에 / 를 입력하면 추천 표시)을 끄고, `Alt+K`와 플로팅 버튼만 쓰세요.

### Codex도 지원하나요?

명령어 조회를 지원합니다. 확장 프로그램 아이콘을 누르고 팝업에서 Codex로 전환하면(또는 `Tab`을 누르면) 모든 Codex 슬래시 명령어를 검색할 수 있고, 누르면 복사되므로 Codex CLI, IDE 확장 프로그램, ChatGPT 데스크톱 앱에 붙여 넣으면 됩니다. Codex 명령어는 ChatGPT 웹 버전에서 동작하지 않으므로 확장 프로그램이 웹 페이지에 Codex 명령어를 입력하지는 않습니다. ChatGPT 데스크톱 앱과 터미널에서 바로 명령어 팔레트를 열려면 [데스크톱 앱](#데스크톱-앱-windows--macos)을 쓰세요.

### DeepSeek도 지원하나요?

지원합니다. DeepSeek의 공식 에이전트 DeepSeek Harness에는 `/plan`, `/goal`, `/compact` 등의 슬래시 명령어가 있고, VibeSlash에 그 설명을 담았습니다([DeepSeek 명령어 모음](#deepseek-명령어-모음) 참고). 데스크톱 앱은 DeepSeek Harness 데스크톱 앱을 인식하고, 브라우저 확장 프로그램의 팝업에서도 찾아볼 수 있습니다. 내 컴퓨터에서 Harness 웹 UI(기본 포트 3080)를 열면 자동으로 DeepSeek로 전환됩니다. Claude Code를 DeepSeek API에 연결해 쓰고 있다면 Claude Code 명령어를 쓰는 것입니다.

### 데이터를 수집하나요?

아니요. 확장 프로그램의 페이지 스크립트는 `https://claude.ai/*`에서만 동작하며, 네트워크 요청을 전혀 하지 않고 대화 기록도 읽지 않습니다. 팝업은 확장 프로그램 아이콘을 눌렀을 때만 현재 탭의 주소를 읽어 어떤 도구인지 판단합니다. 설정과 사용자 정의 명령어는 브라우저 자체 저장소에 저장됩니다.

### Firefox / Safari를 지원하나요?

현재는 Chrome, Edge 등 Chromium 기반 브라우저(Manifest V3)를 지원하며, Firefox와 Safari는 아직 지원하지 않습니다.

## 로드맵

- [x] Chrome / Edge 확장 프로그램: Claude Code 웹 버전 명령어 추천과 명령어 팔레트
- [x] Codex 슬래시 명령어 중국어 설명, 팝업에서 조회
- [x] 데스크톱 앱 미리보기(Windows / macOS): Claude 데스크톱 앱, ChatGPT 데스크톱 앱의 Codex 모드, 터미널에서 단축키로 명령어 팔레트를 열고 현재 클라이언트를 자동 인식
- [x] [웹사이트](https://joygogogo163.github.io/claudetools/ko/): Claude Code, Codex, DeepSeek 명령어 모음(中文, English, 日本語, 한국어)
- [x] 데스크톱 앱: `/`를 입력하면 명령어 팔레트 자동 표시, 끌어서 옮길 수 있는 플로팅 버튼
- [x] DeepSeek Harness 명령어 조회와 데스크톱 앱 인식
- [ ] 데스크톱 앱: 사용자 정의 명령어, 코드 서명, 자동 업데이트

## 상표 고지

Claude와 Claude Code는 Anthropic, PBC의 상표이며, Codex와 ChatGPT는 OpenAI의 상표이고, DeepSeek는 해당 권리자의 상표입니다. VibeSlash는 독립적인 비공식 오픈소스 프로젝트로, Anthropic, OpenAI, DeepSeek와 아무런 관련이 없으며 승인·후원·허가를 받지 않았습니다. 이 이름들은 호환성을 설명하기 위해서만 사용하며, 모든 상표는 각 소유자에게 있습니다.

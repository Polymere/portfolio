# Biped Copilot - Feature Development Timeline

## Pre-1.0 Era (2021-2022) — "SoundMap"
*Originally named SoundMap / SoundMapio*

- **v0.4.2 - v0.4.3** (Nov-Dec 2021): Foundational system
  - Object detection (YOLOv5), obstacle detection, ground plane detection
  - 3D audio feedback (spatialized sounds, pitch shift, moving sounds)
  - Object tracking with SORT tracker
  - Priority management for audio feedback
  - BLE communication with mobile app
  - Benchmarking framework
  - Multi-language verbal sounds
  - Data collection, simulation on image files
  - Multiprocessing architecture with shared memory

---

## 1.0.x Series (Nov 2022 - Mar 2023) — Pre-production

| Version | Date | Key Features |
|---------|------|-------------|
| **1.0.0** | 2022-11-07 | Debian package build, production setup, device service |
| **1.0.1** | 2022-11-08 | Output folder size check, battery from env |
| **1.0.2** | 2022-12-20 | iOS BLE stability (kernel settings service) |
| **1.0.3** | 2022-12-20 | Multi-language audio (FR/DE), camera orientation watcher, point cloud pytest, obstacle projection fixes, global timers |
| **1.0.4** | 2023-01-04 | Separate error log file, Qhull crash fix |
| **1.0.5** | 2023-01-23 | Rerun visualizer, object detection toggle, headphone management moved to biped_ble |
| **1.0.6** | 2023-01-23 | Remote diagnostics upload, camera assignment script |
| **1.0.7** | 2023-01-26 | Upload success notification |
| **1.0.8** | 2023-02-14 | Camera calibration script, custom events, device status script, removed colored depth pipeline |
| **1.0.9** | 2023-02-24 | Fake obstacle tracking, iOS disconnect fix |
| **1.0.10** | 2023-03-14 | Patch release |

---

## 1.1.x - 1.2.x (Mar-Jun 2023) — Edge 2 + Navigation

| Version | Date | Key Features |
|---------|------|-------------|
| **1.1.0** | 2023-03-27 | Synchronization rework, continuous close-obstacle sounds (audio engine 2.1), vote-based ground detection |
| **1.1.1** | 2023-04-03 | Device-app communication rework, headphone info sharing |
| **1.2.0-dev** | 2023-05-10 | **Edge 2 support**, obstacle tracking + risk model, image polling/processing split, hemispatial neglect priority, navigation commands, 3D projection, guide dog rule, motion detection, PCL stabilization |
| **1.2.0** | 2023-05-31 | Offline processing, Edge 2 production config |
| **1.2.1** | 2023-06-05 | App headphone unpairing, deprecated detection objects cleanup |

---

## 1.3.x - 1.5.x (Jun-Nov 2023) — 3D Tracking + Hole Detection

| Version | Date | Key Features |
|---------|------|-------------|
| **1.3.0** | 2023-06-29 | **VIM3 support** (dual debian packages), Detection3D rework (closest-point feedback), camera sync improvements, removed object detection, GCloud diagnostics |
| **1.3.1** | 2023-07-31 | Data collection, auto exposure, crash detection, Edge 2 battery integration, high accuracy preset |
| **1.3.2** | 2023-09-07 | Patch |
| **1.4.0** | 2023-10-11 | **3D tracking** (Kalman), higher resolution support, small obstacle detection, ANN rule, speed estimation, Cython compilation, ruff linter introduction, post-assembly tests, copilot as installable package |
| **1.5.0** | 2023-11-20 | **Hole detection** (KD-tree based), adaptive voxelization, BLE hole detection toggle, feedback result saver, Google Package Registry hosting |

---

## 1.6.x - 1.7.x (Dec 2023 - Feb 2024) — GPS + Risk Model

| Version | Date | Key Features |
|---------|------|-------------|
| **1.6.0** | 2023-12-14 | **GPS integration**, stricter indoor/stairs ground detection, device rotation warning, battery improvement on pause, reduced sound delay on start |
| **1.6.1** | 2023-12-20 | Patch |
| **1.7.0** | 2024-02-06 | Risk model integration, full obstacle corridor + voxel masking, runtime stream reconfigure, multi-use buttons, hand/occlusion detection, distance offset based on user motion, new device targets |
| **1.7.1** | 2024-02-14 | Mask fix |

---

## 1.8.x (Mar-Apr 2024) — AI Scene Description

| Version | Date | Key Features |
|---------|------|-------------|
| **1.8.0** | 2024-03-16 | **OpenAI/ChatGPT scene description** (button-triggered), cadet (dev environment) merge into monorepo, state machine for app, GPT audio flow, corridor rework (ellipse), indoor navigation audio, OpenAI prompts moved to server, benchmarking merge, multiple Gaussian risk model |
| **1.8.1** | 2024-04-05 | Obstacle size classification, local label query, TTS generation, zone of interest audio, magnetometer prototype, camera configuration sequence |
| **1.8.2** | 2024-04-08 | Hotfix |
| **1.8.3** | 2024-04-10 | Hotfix |

---

## 1.9.x (May-Nov 2024) — NOA Device + Sentry

| Version | Date | Key Features |
|---------|------|-------------|
| **1.9.0-alpha.1** | 2024-05-15 | Sentry logging/error tracking, JWT authentication, Docker support, depth quality monitoring, frozen depth monitor, BLE monorepo migration, scene description abort on pause |
| **1.9.0-alpha.2** | 2024-06-24 | **NOA device** support (button strip, menu system, A1 AI detection classes, obstacle range control), gsensor motion estimation, scene description production server |
| **1.8.6** | 2024-07-03 | NOA pre-release (backport of NOA features to 1.8.x line) |
| **1.9.1-alpha** | 2024-07-16 | NOA menu improvements, BLE reset from buttons, hanging process detection, sentry in production, multithreaded camera streams, QC script for buttons |
| **1.9.2** | 2024-07-22 | NOA bug fixes, AI menu classes, Webots migration, end-to-end testing framework, message queue for warnings/navigation |
| **1.9.3** | 2024-09-09 | Battery estimation improvements |
| **1.9.4** | 2024-10-08 | Cherry picks and stability |
| **1.9.5** | 2024-10-30 | Pre-release |
| **1.9.7** | 2024-11-13 | **Obstacle sharpness** audio, Gemini-generated audio assets, camera module adaptation for ground/hole detection, scene description prompts improvements |

---

## 1.10.x (Dec 2024 - Jan 2025) — Language + Localization

| Version | Date | Key Features |
|---------|------|-------------|
| **1.10.0/1.10.1** | 2024-12-18 / 2025-01-08 | **Multi-language support** (biped_language 0.1.0), online TTS + auto-translate, **local occupancy grid**, BLE rework, audio rework, obstacle scanning, obstacle mode/width characteristics, favorite destinations, setting summary (double select), discard-per-zone rule, video description improvements, bus stop detection class, token-to-audio streaming, JPEG compression for requests |

---

## 1.11.x (Feb-Mar 2025) — Video Description + Navigation

| Version | Date | Key Features |
|---------|------|-------------|
| **1.11.0** | 2025-02-12 | **Video description** (route following, overlap rework, concurrent scene/video), favorite destination integration, wall spatialization investigation, A2 toggle, Swedish/Danish/Finnish/Norwegian/Filipino/Mandarin support, obstacle ramp audio (engine 3.5), data collection upload, magnetometer reading, structured output from AI, navigation progress messages, GPX saving, obstacle scanning temporal separation |
| **1.11.1** | 2025-03-11 | Person finding (A1 menu), ground sampling fix, menu audio soft lock fix, inlier threshold scaling |

---

## 1.12.x (May-Jun 2025) — Structured AI Output + Rich Navigation

| Version | Date | Key Features |
|---------|------|-------------|
| **1.12.0** | 2025-05-29 | **Structured output** from AI (file caching), **rich navigation instructions**, guide dog context in prompts, concurrent scene/video description, prompt improvements, video description thread fixes, user settings migration management, server request data storage, 10 favorite destinations, QC improvements |
| **1.12.1** | 2025-06-09 | Hotfix |

---

## Sub-Projects Timeline

| Project | Versions | Period | Key Features |
|---------|----------|--------|-------------|
| **biped_ble** | 0.1.0 - 0.4.0 | 2022-2025 | BLE communication library (dbus-python), iOS disconnect, headphone management, Poetry migration |
| **biped_language** | 0.1.0 - 0.3.0 | Dec 2024 - Jan 2025 | Language detection/matching, Filipino + Mandarin support |
| **server_interface** | 3.1.0 - 7.0.1 | Oct 2024 - May 2025 | GCloud TTS, scene description prompts, language support, JWT auth, person finding prompts, session management |
| **benchmark** | 0.9.x - 1.6.x | 2022-2023 | Obstacle detection metrics, synthetic data, CVAT integration |
| **noa_assembly_qc** | 0.1.4 - 0.2.1 | Feb 2025 - Jul 2025 | Quality control tooling for NOA device assembly |
| **kartia** | 0.0.2 - 0.0.3 | Oct 2024 - Jan 2025 | Indoor navigation with ArUco markers |

<div align="center">

# ⚡ DevFlow

### A developer productivity & issue-tracking platform — built for teams that actually enjoy using their tools.

<p>
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
</p>

<p>
  <img src="https://img.shields.io/badge/status-in%20development-yellow?style=flat-square" alt="status"/>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome"/>
</p>

</div>

<br/>

> [!NOTE]
> DevFlow isn't just another issue tracker clone. It's built to feel *alive* — real-time team chat, mood-based project health instead of a boring progress bar, and quick interactions that don't feel like filling out enterprise forms.

<br/>

## 🧭 Table of Contents

- [About](#-about)
- [Team](#-team)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

<br/>

## 📌 About

**DevFlow** is a full-stack, Jira-style project and issue management platform designed to bring a bit of personality back into developer productivity tools. It supports multi-workspace, multi-project team collaboration with role-based access control, GitHub integration, live team chat, and a set of UX touches designed to make daily use feel fast and a little fun — without sacrificing the structure teams actually need to ship work.

Built collaboratively as a full-scale backend engineering project, with a strong focus on scalable architecture, clean domain modeling, and real-world engineering concepts (RBAC, webhooks, real-time messaging, notification systems) — not just CRUD.

<br/>

## 👥 Team

<div align="center">

| | |
|---|---|
| 🧑‍💻 | [Abhivansh Parashar](https://github.com/Abhivansh-Parashar) |
| 🧑‍💻 | [Aarav Goel](https://github.com/aaravgoel06) |

</div>

<br/>

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🏢 Workspaces & Projects
- Multi-workspace support — one user, many companies/teams
- Projects as true subsets of workspace membership
- Owners can add/remove project members
- Seamless workspace/project switching in the UI

### 🔐 Access & Invites
- Role-based access control (RBAC)
- Invite by email **or** username, with validation
- Invites appear as an instant popup on login — accept/reject in one click

</td>
<td width="50%" valign="top">

### 🐛 Issue Tracking
- Full status lifecycle for issues
- Click-to-open issue detail view
- Prev/Next navigation between issues with slide animation
- Long-press radial quick-action menu

### 💬 Real-Time Collaboration
- Per-project group chat scoped to members
- `@mention` support by username
- Animated mood/status stickers (😄 / 😤 / 🔥) — just for vibes, not workload tracking

</td>
</tr>
</table>

### 🌡️ Vibe Check — Project Health, Reimagined
Instead of a plain progress bar, DevFlow shows a **mood-based project health indicator** that reflects how a project is actually going — a small but deliberate UX bet on making status *feel* human.

### 🔗 GitHub Integration
- Webhook-based sync between GitHub activity and DevFlow issues
- Notification system for real-time updates across workspaces

<br/>

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Backend** | Java, Spring Boot, Spring Security |
| **Database** | MySQL |
| **Frontend** | React |
| **Real-Time** | WebSockets |
| **Integrations** | GitHub Webhooks |

</div>

> [!TIP]
> Backend engineering is the primary focus of this project — the API is designed to be scalable, modular, and technology-rich by design (this project intentionally explores as many real-world backend concepts as feasible).

<br/>

## 🏗 Architecture

```
┌─────────────┐      REST / WebSocket      ┌──────────────────┐
│   React UI   │ ─────────────────────────▶ │   Spring Boot API │
└─────────────┘                             └────────┬─────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              ▼                        ▼                        ▼
                       ┌─────────────┐         ┌──────────────┐        ┌──────────────┐
                       │    MySQL     │         │  GitHub API   │        │ Notification  │
                       │   Database   │         │  (Webhooks)   │        │    Service    │
                       └─────────────┘         └──────────────┘        └──────────────┘
```


<br/>

## 📂 Project Structure

```
devflow/
├── backend/
│   ├── src/main/java/com/devflow/
│   │   ├── workspace/
│   │   ├── project/
│   │   ├── issue/
│   │   ├── chat/
│   │   ├── auth/
│   │   └── notification/
│   └── src/main/resources/
├── frontend/
│   └── src/
└── README.md
```

<br/>

## 🗺 Roadmap

- [x] Workspace & project structure with RBAC
- [x] Issue lifecycle & tracking
- [x] Invite system (email/username)
- [x] Per-project real-time chat
- [x] Mood-based project health indicator
- [ ] GitHub webhook integration
- [ ] Notification system
- [ ] Deployment & CI/CD pipeline

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
# open a Pull Request
```

<br/>

## 📄 License

This project is licensed under the **MIT License**.

<br/>

<div align="center">

Built with ☕, a lot of debugging, and a strong dislike for boring progress bars.

</div>

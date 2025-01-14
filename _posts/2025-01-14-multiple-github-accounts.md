---
layout: post
title:  "Managing Multiple GitHub Accounts for Multiple Projects"
author: kevin
categories: [ Github, Tips ]
image: assets/images/2025-01-14-multiple-github-accounts.png
---

If you’re working on multiple projects with different GitHub configurations, such as using separate user credentials (e.g., work and personal accounts), you can set up multiple configurations in Git. Here's how to manage it step by step:

---

## 1. Set Up SSH Keys for Each Account

Generate separate SSH keys for each account:

```bash
# For personal account
ssh-keygen -t ed25519 -C "your_personal_email@example.com"
# Save as: ~/.ssh/id_ed25519_personal

# For work account
ssh-keygen -t ed25519 -C "your_work_email@example.com"
# Save as: ~/.ssh/id_ed25519_work
```

Add the SSH keys to your SSH agent:

```bash
eval "$(ssh-agent -s)"

ssh-add ~/.ssh/id_ed25519_personal
ssh-add ~/.ssh/id_ed25519_work
```

Add the public keys to their respective GitHub accounts:

1. Copy the public key:
   ```bash
   cat ~/.ssh/id_ed25519_personal.pub
   cat ~/.ssh/id_ed25519_work.pub
   ```
2. Paste the key into the **SSH and GPG keys** section on GitHub for each account.

---

## 2. Edit SSH Config File

Configure SSH to use the correct key for each GitHub account. Edit (or create) the `~/.ssh/config` file:

```bash
nano ~/.ssh/config
```

Add the following:

```plaintext
# Personal GitHub account
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

# Work GitHub account
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
```

---

## 3. Clone Repositories Using the Correct Host

When cloning, specify the alias (`github-personal` or `github-work`):

```bash
# For personal repository
git clone git@github-personal:username/repository.git

# For work repository
git clone git@github-work:organization/repository.git
```

If you cloned the repository using default SSH key, you can use the following command to set the correct remote URL:

```bash
# Clone the repository using default SSH key
git clone git@github.com:username/repository.git

# Set the correct remote URL
git remote set-url origin git@github-personal:username/repository.git
```

---

## 4. Set Global and Local Git Configurations

Set the global Git configuration for your personal account:

```bash
git config --global user.name "Personal Name"
git config --global user.email "your_personal_email@example.com"
```

Override with local configuration for work projects:

```bash
cd /path/to/work-project
git config user.name "Work Name"
git config user.email "your_work_email@example.com"
```

---

## 5. Test the Configuration

Check the current configuration in a project:

```bash
git config user.name
git config user.email
```

Push to verify the correct credentials are being used:

```bash
git push
```

---

## Tips

- If you're using HTTPS instead of SSH, use Git credentials cache or a credentials manager to differentiate accounts.
- Use `git remote -v` to ensure you're pushing to the correct remote URL (personal or work).

By following these steps, you can seamlessly manage multiple GitHub accounts across different projects. Let me know if you have any questions or run into issues!

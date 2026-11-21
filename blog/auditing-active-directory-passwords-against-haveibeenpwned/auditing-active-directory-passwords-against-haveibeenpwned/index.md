---
cover: ad
date: 2022-02-08
tags:
- advanced
- blog
- governance
- passwords
- security
---
Any password policy, even with strict rules, can be bypassed easily with simple tricks: `Passw0rd!`, `Passw0rd$` and `Password!1` can all be valid passwords for length and complexity.

In this common scenario, it is useful to audit the Active Directory passwords regularly against password dictionaries (like RockYou) and/or [HaveIBeenPwned](https://haveibeenpwned.com/ "';--have I been pwned?").

Let's see how to audit Active Directory passwords with the [Directory Services Internals PowerShell Module and Framework](https://github.com/MichaelGrafnetter/DSInternals "DSInternals").

## Installation

We open PowerShell with administrative privileges and check the PowerShell version:

```text
PS C:\Windows\system32> $PSVersionTable
```

`$PSVersionTable` must report version 5.1 at least.

We install DSInternals:

```text
PS C:\Windows\system32> Install-Module DSInternals -Force
```

If we get the error `PackageManagement\Install-PackageProvider : No match was found for the specified search criteria for the provider 'NuGet'. The package provider requires 'PackageManagement' and 'Provider' tags`, we modify the security protocols (the default is Ssl3 and Tls) and reinstall:

```text
PS C:\Windows\system32> [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
PS C:\Windows\system32> $PSVersionTable
```

We list the available cmdlets:

```text
PS C:\Windows\system32> Get-Command -Module DSInternals*
```

## Find Weak Passwords on a Domain Controller

Before we start the audit, we need at least one dictionary file. We download any [wordlist](https://github.com/praetorian-inc/Hob0Rules/blob/master/wordlists/rockyou.txt.gz "RockYou wordlist").

We set the environment:

```text
$DictFile = "C:\Users\Administrator\Downloads\rockyou.txt"
$DC = "dc01"
$Domain = "DC=example,DC=com"
```

We start the audit:

```text
Get-ADReplAccount -All -Server $DC -NamingContext $Domain | Test-PasswordQuality -WeakPasswordsFile $DictFile -IncludeDisabledAccounts
```

We can also build a report in CSV format:

```text
PS C:\Users\Administrator> $Accounts = Get-ADReplAccount -All -Server $DC -NamingContext $Domain
PS C:\Users\Administrator> $Results = $Accounts | Test-PasswordQuality -WeakPasswordsFile $DictFile
PS C:\Users\Administrator> $RiskyAccounts = $Accounts | where {$Results.WeakPassword -match $_.SamAccountName}
PS C:\Users\Administrator> $RiskyAccounts | select SamAccountName,DisplayName,DistinguishedName | Export-Csv output.csv
```

Note that there are no built-in tools to set the list of bad passwords for Active Directory Domain Services.

## Export Data for a Remote Audit

At the moment, DSInternals cannot serialize accounts. See the [associated issue](https://github.com/MichaelGrafnetter/DSInternals/issues/96 "DSAccount XML Serialization").

Once it is fixed, the procedure should be as follows:

```text
PS C:\Users\andrea> $Password = Read-Host "Enter password (16 chars)" -AsSecureString
PS C:\Users\andrea> $Accounts = Get-ADReplAccount -All -Server $DC -NamingContext $Domain
PS C:\Users\andrea> $SerialAccounts = [System.Management.Automation.PSSerializer]::Serialize($Accounts)
PS C:\Users\andrea> $SerialAccounts | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString -SecureKey $Password | Set-Content -Path credentials.txt
```

We move the file to an external station **with PowerShell 7** and get the data back:

```text
PS C:\Users\andrea> $Password = Read-Host "Enter password (16 chars)" -AsSecureString
PS C:\Users\andrea> $SerialAccounts = Get-Content -Path credentials.txt | ConvertTo-SecureString -SecureKey $Password | ConvertFrom-SecureString -AsPlainText
PS C:\Users\andrea> $Accounts = [System.Management.Automation.PSSerializer]::DeSerialize($SerialAccounts)
```

We analyze the data as before:

```text
$DictFile = "C:\Users\andrea\Downloads\rockyou.txt"
$DC = "dc01"
$Domain = "DC=example,DC=com"
PS C:\Users\Administrator> $Results = $Accounts | Test-PasswordQuality -WeakPasswordsFile $DictFile
PS C:\Users\Administrator> $RiskyAccounts = $Accounts | where {$Results.WeakPassword -match $_.SamAccountName}
PS C:\Users\Administrator> $RiskyAccounts | select SamAccountName,DisplayName,DistinguishedName | Export-Csv output.csv
```

## Check for Breached Credentials (HaveIBeenPwned)

I usually test whether users use leaked passwords. To do so, we download the [password list from HaveIBeenPwned](https://haveibeenpwned.com/Passwords "Downloading the Pwned Passwords list") and use the NTLM file ordered by hash.

We analyze the [[Weak Passwords and Unauthorized Access|weak passwords]] with the downloaded file:

```text
PS C:\Users\Administrator\Downloads> $Accounts | Test-PasswordQuality -WeakPasswordHashesSortedFile .\pwned-passwords-ntlm-ordered-by-hash-v8.txt
PS C:\Users\Administrator> $RiskyAccounts = $Accounts | where {$Results.WeakPassword -match $_.SamAccountName}
PS C:\Users\Administrator> $RiskyAccounts | select SamAccountName,DisplayName,DistinguishedName | Export-Csv output.csv
```

## Next Steps

We should force each account with a weak password to change it at the next login, and notify the user via email. Depending on the policies of the organization, this could count as a security incident.

## References

* [Directory Services Internals PowerShell Module and Framework](https://github.com/MichaelGrafnetter/DSInternals "DSInternals")
* [Auditing Weak Passwords in Active Directory](http://woshub.com/auditing-users-password-strength-in-ad/ "Auditing Weak Passwords in Active Directory")
* [Test-PasswordQuality](https://github.com/MichaelGrafnetter/DSInternals/blob/master/Documentation/PowerShell/Test-PasswordQuality.md#test-passwordquality "Test-PasswordQuality")
* [Active Directory Password Audit – Using Pwned Passwords](https://cybersectalk.com/2019/08/19/active-directory-password-audit-using-pwned-passwords/ "Active Directory Password Audit – Using Pwned Passwords")
* [SecLists](https://github.com/danielmiessler/SecLists "SecLists")
* [Downloading the Pwned Passwords list](https://haveibeenpwned.com/Passwords "Downloading the Pwned Passwords list")

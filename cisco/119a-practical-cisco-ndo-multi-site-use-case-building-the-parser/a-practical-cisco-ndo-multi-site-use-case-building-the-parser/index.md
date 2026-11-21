---
cover: cisco
date: 2025-11-23
tags:
- aci
- advanced
- cisco
- ndo
- netascode
---
The parser is a custom script that converts the user input (CSV files) into NaC configuration. It also performs the data validation described in the [[A practical Cisco NDO multi-site use case data validation|previous post]]. If it succeeds, the parser generates the NaC files in the `nac-data` directory, which [[Importing NaC objects from Cisco ACI into Terraform|Terraform]] then consumes to configure NDO and APIC.

The parser consists of two main files:

* `infra.py`: reads the CSV files, validates the data and builds the NaC data structure.
* `build-nac-data.py`: uses `infra.py` to generate the Terraform files, organized by environment (NDO, APIC) and site (`MI`, `RM`, `SHARED`).

It is nearly impossible to describe both Python files in full detail here, so we give a high-level overview.

## infra.py

The `infra.py` file defines the object [[Cisco ACI Classes|classes]] for APIC, `VRF`, `Leaf`, `Network` and `InterfaceGroup`. The objects are defined with [Pydantic](https://docs.pydantic.dev/), which provides data normalization and first-level validation.

The `VRF` class:

```python
class VRF(BaseModel):
    name: str

    def __str__(self):
        return self.name

    @field_validator("name", mode="before")
    @classmethod
    def parse_name(cls, raw=str | None):
        if raw:
            return raw.strip()
        return "default"

    @model_validator(mode="after")
    def validate_rules(self):
        if not self.name.replace("_", "").replace("-", "").isalnum():
            raise ValueError(f"With VRF {self.name}, name is not valid")

        return self
```

The class defines a `name` attribute (string type). A `before` validator assigns `name=default` if the field is empty, while an `after` validator ensures that the name is alphanumeric (allowing `-` and `_`).

The `Infra` class loads all the files that define the infrastructure (`l2-networks.csv`, `fabric-interfaces.csv`, `fabric-leaves.csv`, `config.yaml`, `secrets.yaml`) and builds a complete data structure:

```python
class Infra:
    def __init__(self):
        # Reading config file
        with open(self._config_file, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)

        # Reading secret file
        with open(self._secrets_file, "r", encoding="utf-8") as f:
            self.secrets = yaml.safe_load(f)

        # Read APIC customization
        with open(self._apic_customization_file, "r", encoding="utf-8") as f:
            self.apic_customization = yaml.safe_load(f)

        # Reading input data
        self.__load_apics__()
        self.__load_l2_networks__()
        self.__load_fabric_leaves__()
        self.__load_fabric_interfaces__()
```

Each `__load` function performs global validation. For example, `__load_l2_networks__` makes sure that VLANs are unique and belong to a defined VLAN pool.

Getter functions let us read the data structure and apply optional filters. For example, we can retrieve the interface groups based on site, leaf ID and interface:

```python
# ***************************************************************************
# Getters: Interface
# ***************************************************************************

def get_interface_group_by_interface_leaf_site(
    self, leaf: Leaf, site: Site, iface: int
) -> InterfaceGroup | None:
    for item in self.interface_groups:
        if (
            item.leaf.name == leaf.name
            and item.site.name == site.name
            and iface in item.ifaces
        ):
            return item
    return None
```

This helps us determine whether an interface is already in use.

The NaC getters generate the NaC-formatted data structures:

```python
# ***************************************************************************
# NaC getters: Fabric
# ***************************************************************************

def get_fabric_access_leaf_interface_vpc_policy_groups(
    self, site: Site, apic: bool = False
) -> List[dict]:
    """Return Fabric -> Access Policies -> Interfaces -> Leaf Interfaces -> Policy Groups."""
    if not apic:
        raise ValueError(
            "With get_fabric_access_leaf_interface_vpc_policy_groups, apic=False is not supported"
        )

    policy_groups_data = []
    for interface_group in self.get_interfaces_group_by_site(site=site):
        # Building vPC policy groups
        if "-" not in interface_group.leaf.name:
            # Skip non vPC
            continue

        policy_group_data = dict(
            self.config["fabric"]["port_channel_policies"][interface_group.profile]
        )
        policy_group_data["name"] = f"{interface_group.selector}_PolGrp"
        policy_groups_data.append(policy_group_data)

    return policy_groups_data
```

For example, `build-nac-data.py` uses `get_fabric_access_leaf_interface_vpc_policy_groups` to create the file `nac-data/apic-fabric-mi.nac.yaml`.

The NaC getters are particularly important when the data requires customization or is shared between NDO and APIC.

For instance, the subnets defined at the Bridge Domain level are managed in NDO. If a subnet is site-specific, however, it must be configured at the site level, not at the template level:

```python
# NDO specific attributes
if site.name == "SHARED":
    bridge_domain["subnets"] = subnets
else:
    bridge_domain["sites"] = [
        {
            "name": self.get_apic_name_by_site(Site(site.name)),
            "subnets": subnets,
        }
    ]
```

Another example involves EPGs: they are configured in NDO, but their interface associations are applied at the APIC level. Since Terraform executed on the APIC overrides the configuration managed by NDO, the `get_tenant_application_profiles` function sets the `ndo_managed` flag, which keeps the object definitions consistent across both domains.

## build-nac-data.py

The `build-nac-data.py` script uses `infra.py` to process the input data and generate the Terraform configuration files.

Files created for **NDO**:

* `ndo.nac.yaml`: defines sites, schema and templates.
* `ndo-*.nac.yaml`: defines Bridge Domains, Subnets, Application Profiles and EPGs per site.

Files created for **APIC**:

* `apic-fabric-*.nac.yaml`: defines the access policies (Leaf Interface Policy Groups, Leaf Interface Profiles and Leaf Switch Profiles) per site, mapping physical interfaces to policy groups.
* `apic-*.terraform.yaml`: defines the switch access policies per site.
* `apic-tenant-*.nac.yaml`: redefines Application Profiles and EPGs per site, mapping interfaces and VLANs to each EPG.

Terraform files generated from Jinja2 templates:

* `site-*/main.tf`: defines the parameters for the NaC integration.
* `site-*/versions.tf`: defines the module versions.
* `site-*/terraform.tfvars`: includes the credentials to access NDO and APIC.
* `site-*/providers.tf`: defines the Terraform provider.
* `site-*/variables.tf`: defines the variables referenced in `terraform.tfvars`.
* `site-*/custom.tf`: includes the Terraform module that configures the resources not supported by NaC.

The parser files are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO).

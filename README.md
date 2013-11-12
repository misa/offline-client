# Offline Client

Web application supporting operators installing new clients.

## Summary
ISP operator needs onsite support when installing new customers.

### Value
* qaulity customer's data
* automatic provisioning of connectivity services

## Requirements
### Overview
* __offline__ web app with local storage
* __form__ for entering customer and services data
  * offline data validation
* __list__ of stored customers
* customer __detail__
  * create customer command when online
  * handling of error states
* backend communication via __REST__

### Customer Form
Customer fields: **name**, supplementary_name, **public_id**, **street**, **city**, **postal_code**, **country**, **email**, dic, contract_no, contact_name, phone, info

Service fields: **name**, **download**, **upload**, **region**, **price**, **period_from**

Services should be available from combo box (prefilled from /products and /regions).

### Contracts Management
* single customer can have more contracts
* one contract can contain more services
* each service is connected to a single contract

customer <- contract(s) <- service(s)

#### Insert customer Use Case
* new customer (POST to /customers would succeed)
* existing customer (POST to /customers would fail, response would suggest existing customers)
  * operator would choose existing customer from a list
  * operator can optionally choose existing contract for a new service from a list

### REST API

All data should be sent in JSON (application/vnd.api+json), http://jsonapi.org/

#### POST /customers
create new customer

#### POST /customers/:id/services
create new service for given customer

#### GET /regions
list of available regions

#### GET /products
list of available products


## Suggested technology
* HTML5 with local storage or IndexedDB
* JSON API (http://jsonapi.org/) for REST communication
* Bootstrap or Foundations for formatting
* JavaScript: AngularJS, Ember, jQuery... use wisely

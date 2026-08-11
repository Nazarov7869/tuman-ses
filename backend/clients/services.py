"""Service catalogue mirrored from the frontend's src/lib/validations.ts
so payment amounts are computed server-side instead of being trusted from
the client."""

SERVICE_CATEGORIES = {
    "Bak labaratoriyasi": [
        {"name": "Brusiliozga seralogik tekshiriv", "price": 55000},
        {
            "name": "Yiringli namunalar gemo.Urina kaprakulturalarni patogen floraga tekshirish va Antibiotiklar sezuvchanligini aniqlash",
            "price": 72000,
        },
        {
            "name": "Dekretiv kontinentlarni ichak infeksiyasiga tekshirish (oziq-ovqat hodimlarini)",
            "price": 72000,
        },
        {"name": "Amblator bemorlarni ichak infeksiyasiga tekshirish", "price": 72000},
        {"name": "Burundan surtma stafilokokkga tekshirish", "price": 72000},
    ],
    "Parazitalogiya labaratoriyasi": [
        {
            "name": "Najas va surtmalarni ikki hil usulda parazitalogik tekshirish (ambulator)",
            "price": 40000,
        },
        {
            "name": "Najas va surtmalarni ikki hil usulda parazitalogik tekshirish dekretiv kontingentlarni (oziq ovqat hodimlari)",
            "price": 40000,
        },
    ],
}

SERVICE_TYPES = [
    service["name"]
    for services in SERVICE_CATEGORIES.values()
    for service in services
]

SERVICE_TYPE_CHOICES = [(name, name) for name in SERVICE_TYPES]


def get_service_price(service_name: str) -> int:
    for services in SERVICE_CATEGORIES.values():
        for service in services:
            if service["name"] == service_name:
                return service["price"]
    return 0

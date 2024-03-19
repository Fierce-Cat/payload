'use client'
import type { CollectionPermission, GlobalPermission } from 'payload/auth'
import type { SanitizedCollectionConfig } from 'payload/types'

import React, { Fragment } from 'react'

import { useConfig } from '../../providers/Config/index.js'
import { useTranslation } from '../../providers/Translation/index.js'
import { formatDate } from '../../utilities/formatDate.js'
import Autosave from '../Autosave/index.js'
import DeleteDocument from '../DeleteDocument/index.js'
import { DuplicateDocument } from '../DuplicateDocument/index.js'
import { Gutter } from '../Gutter/index.js'
import { PopupList } from '../Popup/index.js'
import { Popup } from '../Popup/index.js'
import { PreviewButton } from '../PreviewButton/index.js'
import { Publish } from '../Publish/index.js'
import { Save } from '../Save/index.js'
import { SaveDraft } from '../SaveDraft/index.js'
import Status from '../Status/index.js'
import './index.scss'

const baseClass = 'doc-controls'

export const DocumentControls: React.FC<{
  apiURL: string
  data?: any
  disableActions?: boolean
  hasSavePermission?: boolean
  id?: number | string
  isAccountView?: boolean
  isEditing?: boolean
  permissions: CollectionPermission | GlobalPermission | null
  slug: SanitizedCollectionConfig['slug']
}> = (props) => {
  const {
    id,
    slug,
    data,
    disableActions,
    hasSavePermission,
    isAccountView,
    isEditing,
    permissions,
  } = props

  const { i18n } = useTranslation()

  const config = useConfig()

  const collectionConfig = config.collections.find((coll) => coll.slug === slug)
  const globalConfig = config.globals.find((global) => global.slug === slug)

  const {
    admin: { dateFormat },
    routes: { admin: adminRoute },
  } = config

  const hasCreatePermission =
    permissions && 'create' in permissions && permissions.create?.permission

  const hasDeletePermission =
    permissions && 'delete' in permissions && permissions.delete?.permission

  const showDotMenu = Boolean(
    collectionConfig && id && !disableActions && (hasCreatePermission || hasDeletePermission),
  )

  return (
    <Gutter className={baseClass}>
      <div className={`${baseClass}__wrapper`}>
        <div className={`${baseClass}__content`}>
          <ul className={`${baseClass}__meta`}>
            {collectionConfig && !isEditing && !isAccountView && (
              <li className={`${baseClass}__list-item`}>
                <p className={`${baseClass}__value`}>
                  {i18n.t('general:creatingNewLabel', {
                    label:
                      typeof collectionConfig?.labels?.singular === 'string'
                        ? collectionConfig.labels.singular
                        : 'document',
                  })}
                </p>
              </li>
            )}
            {(collectionConfig?.versions?.drafts || globalConfig?.versions?.drafts) && (
              <Fragment>
                {(globalConfig || (collectionConfig && isEditing)) && (
                  <li
                    className={[`${baseClass}__status`, `${baseClass}__list-item`]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Status />
                  </li>
                )}
                {((collectionConfig?.versions?.drafts &&
                  collectionConfig?.versions?.drafts?.autosave) ||
                  (globalConfig?.versions?.drafts && globalConfig?.versions?.drafts?.autosave)) &&
                  hasSavePermission && (
                    <li className={`${baseClass}__list-item`}>
                      <Autosave
                        collection={collectionConfig}
                        global={globalConfig}
                        id={id}
                        publishedDocUpdatedAt={data?.createdAt}
                      />
                    </li>
                  )}
              </Fragment>
            )}
            {collectionConfig?.timestamps && (isEditing || isAccountView) && (
              <Fragment>
                <li
                  className={[`${baseClass}__list-item`, `${baseClass}__value-wrap`]
                    .filter(Boolean)
                    .join(' ')}
                  title={
                    data?.updatedAt ? formatDate(data?.updatedAt, dateFormat, i18n.language) : ''
                  }
                >
                  <p className={`${baseClass}__label`}>{i18n.t('general:lastModified')}:&nbsp;</p>
                  {data?.updatedAt && (
                    <p className={`${baseClass}__value`}>
                      {formatDate(data.updatedAt, dateFormat, i18n.language)}
                    </p>
                  )}
                </li>
                <li
                  className={[`${baseClass}__list-item`, `${baseClass}__value-wrap`]
                    .filter(Boolean)
                    .join(' ')}
                  title={
                    data?.createdAt ? formatDate(data?.createdAt, dateFormat, i18n.language) : ''
                  }
                >
                  <p className={`${baseClass}__label`}>{i18n.t('general:created')}:&nbsp;</p>
                  {data?.createdAt && (
                    <p className={`${baseClass}__value`}>
                      {formatDate(data?.createdAt, dateFormat, i18n.language)}
                    </p>
                  )}
                </li>
              </Fragment>
            )}
          </ul>
        </div>
        <div className={`${baseClass}__controls-wrapper`}>
          <div className={`${baseClass}__controls`}>
            {/* {(collectionConfig?.admin?.preview || globalConfig?.admin?.preview) && (
              <PreviewButton
                CustomComponent={
                  collectionConfig?.admin?.components?.edit?.PreviewButton ||
                  globalConfig?.admin?.components?.elements?.PreviewButton
                }
                generatePreviewURL={collectionConfig?.admin?.preview || globalConfig?.admin?.preview}
              />
            )} */}
            {hasSavePermission && (
              <React.Fragment>
                {collectionConfig?.versions?.drafts || globalConfig?.versions?.drafts ? (
                  <React.Fragment>
                    {((collectionConfig?.versions?.drafts &&
                      !collectionConfig?.versions?.drafts?.autosave) ||
                      (globalConfig?.versions?.drafts &&
                        !globalConfig?.versions?.drafts?.autosave)) && (
                      <SaveDraft
                        CustomComponent={
                          collectionConfig?.admin?.components?.edit?.SaveDraftButton ||
                          globalConfig?.admin?.components?.elements?.SaveDraftButton
                        }
                      />
                    )}
                    <Publish
                      CustomComponent={
                        collectionConfig?.admin?.components?.edit?.PublishButton ||
                        globalConfig?.admin?.components?.elements?.PublishButton
                      }
                    />
                  </React.Fragment>
                ) : (
                  <Save
                    CustomComponent={
                      collectionConfig?.admin?.components?.edit?.SaveButton ||
                      globalConfig?.admin?.components?.elements?.SaveButton
                    }
                  />
                )}
              </React.Fragment>
            )}
          </div>
          {showDotMenu && (
            <Popup
              button={
                <div className={`${baseClass}__dots`}>
                  <div />
                  <div />
                  <div />
                </div>
              }
              className={`${baseClass}__popup`}
              horizontalAlign="right"
              size="large"
              verticalAlign="bottom"
            >
              <PopupList.ButtonGroup>
                {hasCreatePermission && (
                  <React.Fragment>
                    <PopupList.Button
                      href={`${adminRoute}/collections/${collectionConfig?.slug}/create`}
                      id="action-create"
                    >
                      {i18n.t('general:createNew')}
                    </PopupList.Button>
                    {!collectionConfig?.admin?.disableDuplicate && isEditing && (
                      <DuplicateDocument
                        id={id.toString()}
                        singularLabel={collectionConfig?.labels?.singular}
                        slug={collectionConfig?.slug}
                      />
                    )}
                  </React.Fragment>
                )}
                {hasDeletePermission && (
                  <DeleteDocument
                    buttonId="action-delete"
                    collectionSlug={collectionConfig?.slug}
                    id={id.toString()}
                    singularLabel={collectionConfig?.labels?.singular}
                    useAsTitle={collectionConfig?.admin?.useAsTitle}
                  />
                )}
              </PopupList.ButtonGroup>
            </Popup>
          )}
        </div>
      </div>
      <div className={`${baseClass}__divider`} />
    </Gutter>
  )
}
